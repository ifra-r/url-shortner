const pool = require('../db');
const { generateSlug, isValidUrl } = require('../utils/urlHelpers');

// POST /api/urls — Create a shortened URL
const createUrl = async (req, res) => {
  const { originalUrl } = req.body;

  // validate url
  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required.' });
  }
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL. Must include a valid protocol (http/https).' });
  }

  try {
    // Generate unique slug (retry if collision occurs)
    let slug;
    let exists = true;
    let attempts = 0;

    // Checks the DB to make sure no other URL has that slug ===> 10 retries if collision
    while (exists && attempts < 10) {
      slug = generateSlug();
      const check = await pool.query('SELECT id FROM urls WHERE short_url = $1', [slug]);
      exists = check.rows.length > 0;
      attempts++;
    }

    // 10 collisions case:
    if (exists) {
      return res.status(500).json({ error: 'Failed to generate a unique slug. Please try again.' });
    }

    // (slug generated) Insert into DB
    const result = await pool.query(
      'INSERT INTO urls (short_url, original_url) VALUES ($1, $2) RETURNING *',
      [slug, originalUrl]
    );

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

// Redirect from short URL to original URL

const redirectUrl = async (req, res) => {
  const { slug } = req.params;      // // grab the slug from the URL, e.g., "jH4IjOey"

  try {
    // Look up the original URL in the DB
    const result = await pool.query(
      'SELECT original_url FROM urls WHERE short_url = $1',
      [slug]
    );

    // If no matching slug, send 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    // Redirect to the original URL with HTTP 302 (temporary redirect)
    return res.redirect(302, result.rows[0].original_url);

  } catch (err) {
    console.error('Error redirecting:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createUrl, redirectUrl };