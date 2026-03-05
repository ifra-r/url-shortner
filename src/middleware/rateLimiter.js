const redis = require('../cache');

const WINDOW_SECONDS = 60;        // 1 minute window
const MAX_REQUESTS = 30;          // max requests per window per IP

// --- generate Redis key for a given IP --> key stores req count for currenr window
function getRateLimitKey(ip) {
  return `rate:${ip}`;
}

// --- get current request count for IP ---
async function getRequestCount(key) {
  try {
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
  } catch {
    return null; // Redis failure — fail open (allow request)
  }
}

// --- increment request count, set TTL on first request ---
async function incrementRequestCount(key) {
  try {
    const count = await redis.incr(key);
    // set expiry only on first request in window so the count resets after the window
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
    return count;
  } catch {
    return null; // Redis failure — fail open
  }
}

// --- Rate limiter middleware ---
const rateLimiter = async (req, res, next) => {
  // grab client IP and compute redis key
  const ip = req.ip;
  const key = getRateLimitKey(ip);

  // inc req count
  const count = await incrementRequestCount(key);

  // Redis failure — fail open, let request through
  if (count === null) {
    console.error('Rate limiter: Redis failure, failing open');
    return next();
  }

  // set headers so client knows their rate limit status
  res.set('X-RateLimit-Limit', MAX_REQUESTS);
  res.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - count));
  res.set('X-RateLimit-Window', `${WINDOW_SECONDS}s`);

  // over limit — reject with 429
  if (count > MAX_REQUESTS) {
    return res.status(429).json({
      error: `Too many requests. Limit is ${MAX_REQUESTS} per ${WINDOW_SECONDS}s.`,
    });
  }

  next();
};

module.exports = rateLimiter;