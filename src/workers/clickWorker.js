const pool = require('../db');
const redis = require('../cache');
const { CLICK_QUEUE_KEY } = require('../utils/clickHelpers');

const DRAIN_INTERVAL_MS = 5000; // drain every 5 seconds

// --- drain all pending click events from Redis list ---
async function drainClickQueue() {
  try {
    const events = [];

    // LPOP one at a time until queue is empty
    let raw;
    while ((raw = await redis.lPop(CLICK_QUEUE_KEY)) !== null) {
      try {
        events.push(JSON.parse(raw));
      } catch {
        console.error('Failed to parse click event:', raw);
      }
    }

    if (events.length === 0) return; // nothing to insert

    // --- bulk insert all clicks in a single query ---
    
    // Map Redis events to PostgreSQL placeholders ($1, $2, …) and flatten values array
    // so we can insert all clicks in one SQL query efficiently instead of one-by-one
    const values = events.map((e, i) => 
      `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    ).join(', ');

    const params = events.flatMap((e) => [
      e.slug,
      e.ip,
      e.userAgent,
      e.clickedAt,
    ]);

    await pool.query(
      `INSERT INTO clicks (slug, ip, user_agent, clicked_at) VALUES ${values}`,
      params
    );

    console.log(`Click worker: inserted ${events.length} click(s)`);
  } catch (err) {
    console.error('Click worker error:', err);
  }
}

// --- Start worker: drain queue on interval ---
function startClickWorker() {
  console.log(`Click worker started — draining every ${DRAIN_INTERVAL_MS / 1000}s`);
  setInterval(drainClickQueue, DRAIN_INTERVAL_MS);
}

module.exports = { startClickWorker };