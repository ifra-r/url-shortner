// helper that pushes click events to a Redis list without blocking the redirect

const redis = require('../cache');

const CLICK_QUEUE_KEY = 'clicks:queue';

// push a click event into Redis queue (non-blocking) 
function pushClickEvent(slug, req) {
  const event = JSON.stringify({
    slug,
    // ip: req.ip,
    ip: req.ip?.replace('::ffff:', '') || null,
    userAgent: req.headers['user-agent'] || null,
    clickedAt: new Date().toISOString(),
  });

   console.log('Pushing click event:', event); // <--- see if this fires

  // fire and forget — do NOT await, redirect must not be blocked
  redis.rPush(CLICK_QUEUE_KEY, event).catch((err) => {
    console.error('Failed to push click event to Redis:', err);
  });
}

module.exports = { pushClickEvent, CLICK_QUEUE_KEY };