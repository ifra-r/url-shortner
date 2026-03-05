const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const MIN_ALIAS_LENGTH = 1; // user picks it, collision irrelevant

//Generates a random alphanumeric slug between 6–10 characters.
// avoiding 1-5 for collision risk
// 6-10 len has enough possibilies.. 8.55 × 10¹⁷ possibilities
let MIN_SLUG_LENGTH = 6;
let MAX_SLUG_LENGTH = 10;

function generateSlug(length = null) {

  // out of bound check. should be b/w min and max slug len
  if (length && (length < MIN_SLUG_LENGTH || length > MAX_SLUG_LENGTH)) {
    throw new Error(`Slug length must be between ${MIN_SLUG_LENGTH} and ${MAX_SLUG_LENGTH}`);
  }
  // If no length specified, pick random between MIN_SLUG_LENGTH and MAX_SLUG_LENGTH
  const slugLength = length || Math.floor(Math.random() * (MAX_SLUG_LENGTH - MIN_SLUG_LENGTH + 1)) + MIN_SLUG_LENGTH;
  let slug = '';
  for (let i = 0; i < slugLength; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

// Validates that a string is a well-formed http/https URL.
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateAlias(alias) {
  if (alias.length < MIN_ALIAS_LENGTH || alias.length > MAX_SLUG_LENGTH) {
    throw new Error(`Alias must be between ${MIN_ALIAS_LENGTH} and ${MAX_SLUG_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9]+$/.test(alias)) {
    throw new Error('Alias can only contain letters and numbers.');
  }
}

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
async function resolveSlug(alias, pool) {
  const MAX_COLLISION_RETRIES = 5;

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
async function insertUrl(slug, originalUrl, expiresAt, pool) {
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
  const redis = require('../cache');
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
  const redis = require('../cache');
  try {
    const ttl = computeTTL(expiresAt);
    if (ttl > 0) {
      await redis.set(`slug:${slug}`, originalUrl, { EX: ttl });
    }
  } catch (err) {
    console.error('Redis set error:', err); // non-fatal, DB is source of truth
  }
}

module.exports = {
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
};