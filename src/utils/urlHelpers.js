const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

//Generates a random alphanumeric slug between 6–8 characters.
let MIN_SLUG_LENGTH = 6;
let MAX_SLUG_LENGTH = 10;
// avoiding 1-5 for collision risk
// 6-10 len has enough possibilies.. 8.55 × 10¹⁷ possibilities

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

module.exports = { generateSlug, isValidUrl };