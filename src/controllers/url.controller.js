const pool = require('../db');
const { 
  generateSlug, 
  isValidUrl, 
  validateAlias, 
  validateCreateInput, 
  resolveSlug, 
  insertUrl, 
  isExpired, 
  computeTTL, 
  getCached, 
  setCached 
} = require('../utils/urlHelpers');

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
    const { slug, error, status } = await resolveSlug(alias, pool);
    if (error) {
      return res.status(status).json({ error });
    }

    // (slug generated) ==> Insert into DB
    const result = await insertUrl(slug, originalUrl, expiresAt, pool);

    // Use BASE_URL from .env, or fallback to localhost with PORT (default 3000)
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