const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// POST /api/urls — create a short URL
export async function createShortUrl(originalUrl, alias = null, expiresAt = null) {
  // build request body
  const body = { originalUrl };
  if (alias) body.alias = alias;
  if (expiresAt) body.expiresAt = expiresAt;

  // send request
  const res = await fetch(`${BASE_URL}/api/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to shorten URL');
  return data;
}

// GET /api/urls/:slug/analytics
export async function getAnalytics(slug) {
  const res = await fetch(`${BASE_URL}/api/urls/${slug}/analytics`);
  const data = await res.json();  // parse 
  if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
  return data;
}