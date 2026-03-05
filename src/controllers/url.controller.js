const pool = require('../db');
const redis = require('../cache');
const { generateSlug, isValidUrl, validateAlias } = require('../utils/urlHelpers');
const MAX_COLLISION_RETRIES = 5;

// validate request body for URL creation  
function validateCreateInput(originalUrl) {
  if (!originalUrl) {
    return 'originalUrl is required.';
  }
  if (!isValidUrl(originalUrl)) {
    return 'Invalid URL. Must include a valid protocol (http/https).';
  }
  return null;
}

// resolve/return slug from alias or auto-generate 
async function resolveSlug(alias) {

  // alias given ==> return alias
  if (alias) {
    // uf a custom alias given: vealidate and verify if it exists. if clear ==> save
    try {
      validateAlias(alias);
    } catch (err) {
      return { error: err.message, status: 400 };
    }
    const existing = await pool.query('SELECT id FROM urls WHERE short_url = $1', [alias]);
    if (existing.rows.length > 0) {
      return { error: 'Alias already taken. Please choose another.', status: 409 };
    }
    return { slug: alias };
  }

  // if no custom alias: generate one and return
  // Checks the DB to make sure no other URL has that slug ===> max retries if collision
  let slug, exists = true, attempts = 0;
  while (exists && attempts < MAX_COLLISION_RETRIES) {
    slug = generateSlug();
    const check = await pool.query('SELECT id FROM urls WHERE short_url = $1', [slug]);
    exists = check.rows.length > 0;
    attempts++;
  }
  // max collisions case:
  if (exists) {
    return { error: 'Failed to generate a unique slug. Please try again.', status: 500 };
  }
  return { slug };
}

// ---  insert URL into DB ---
async function insertUrl(slug, originalUrl, expiresAt) {
  return pool.query(
    `INSERT INTO urls (short_url, original_url, expires_at)
      VALUES ($1, $2, COALESCE($3::TIMESTAMP, NOW() + INTERVAL '30 days'))
      RETURNING *`,
    [slug, originalUrl, expiresAt || null]
  );
}

// --- check if a URL row is expired ---
function isExpired(row) {
  return row.expires_at && new Date(row.expires_at) < new Date();
}

// POST /api/urls — Create a shortened URL
const createUrl = async (req, res) => {
  const { originalUrl, expiresAt, alias } = req.body;

  // validate url
  const validationError = validateCreateInput(originalUrl);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // slug generation : custom alias and random case both.
  try {
    const { slug, error, status } = await resolveSlug(alias);
    if (error) {
      return res.status(status).json({ error });
    }

    // (slug generated) ==> Insert into DB
    const result = await insertUrl(slug, originalUrl, expiresAt);

    // Use BASE_URL from .env, or fallback to localhost with PORT (default 3000) if not set
    // short url: baseurl/slug
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Return the shortened URL
    return res.status(201).json({
      id: result.rows[0].id,
      shortUrl: `${baseUrl}/${slug}`,
      originalUrl: result.rows[0].original_url,
      createdAt: result.rows[0].created_at,
    });
  } catch (err) {
    console.error('Error creating short URL:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};



// ========================= REDIRECTION =========================


// ---  compute TTL in seconds for Redis ---
function computeTTL(expiresAt) {
  const DEFAULT_TTL = 60 * 60 * 24; // 1 day in seconds
  if (!expiresAt) return DEFAULT_TTL;
  const ttl = Math.floor((new Date(expiresAt) - new Date()) / 1000);
  // if already expired or less than 1s, return 0
  return Math.max(0, Math.min(ttl, DEFAULT_TTL));
}

// get cached URL from Redis before hitting DB
async function getCached(slug) {
  try {
    const cached = await redis.get(`slug:${slug}`);

    if (cached) {
      // temp logging
      console.log('Cache hit for slug:', slug);
      return cached;
    }
    // temp logging for cache miss
    console.log('Cache miss for slug:', slug);
    return null; // Redis miss
  } catch {
    return null; // Redis failure — fallback to DB
  }
}

// --- store cache URL in Redis with correct TTL ---
async function setCached(slug, originalUrl, expiresAt) {
  try {
    const ttl = computeTTL(expiresAt);
    if (ttl > 0) {
      await redis.set(`slug:${slug}`, originalUrl, { EX: ttl });
    }
  } catch (err) {
    console.error('Redis set error:', err); // non-fatal, DB is source of truth
  }
}


// Redirect from short URL to original URL
// const redirectUrl = async (req, res) => {
//   const { slug } = req.params;      // // grab the slug from the URL, e.g., "jH4IjOey"
//   try {
//     // Look up the original URL in the DB
//     const result = await pool.query(
//       'SELECT original_url, expires_at FROM urls WHERE short_url = $1',
//       [slug]
//     );

//     // If no matching slug, send 404
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Short URL not found.' });
//     }

//     const row = result.rows[0];

//     // check if expired
//     if (isExpired(row)) {
//       return res.status(410).json({ error: 'This short URL has expired.' });
//     }

//     // Redirect to the original URL with HTTP 302 (temporary redirect)
//     return res.redirect(302, result.rows[0].original_url);
//   } catch (err) {
//     console.error('Error redirecting:', err);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };



// Redirect from short URL to original URL
const redirectUrl = async (req, res) => {
  const { slug } = req.params;      // // grab the slug from the URL, e.g., "jH4IjOey"
  try {
    // Check Redis first
    const cached = await getCached(slug);
    if (cached) {
      return res.redirect(302, cached);
    }

    // Look up the original URL in the DB
    const result = await pool.query(
      'SELECT original_url, expires_at FROM urls WHERE short_url = $1',
      [slug]
    );

    // If no matching slug, send 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    const row = result.rows[0];

    // check if expired
    if (isExpired(row)) {
      // log expired access
      console.log('Attempt to access expired slug:', slug);
      return res.status(410).json({ error: 'This short URL has expired.' });
    }

    // If miss → fetch DB → cache result with correct TTL
    await setCached(slug, row.original_url, row.expires_at);

    // Redirect to the original URL with HTTP 302 (temporary redirect)
    return res.redirect(302, row.original_url);
  } catch (err) {
    console.error('Error redirecting:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
module.exports = { createUrl, redirectUrl }; 