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

// ------------------ daily aggregation !!!

// Why batch aggregation instead of incrementing per click?
// 1. Avoids heavy DB writes per request (better performance at scale)
// 2. Prevents race conditions with concurrent updates
// 3. Keeps raw click data for detailed analytics (IP, user agent, timestamps)
// 4. Enables efficient time-series queries (daily stats) without scanning huge tables

// --- aggregate raw clicks into clicks_daily for yesterday ---
async function aggregateDailyClicks() {
  try {
    // upsert yesterday's click counts from raw clicks table into clicks_daily
    await pool.query(`
      INSERT INTO clicks_daily (slug, date, click_count)
      SELECT slug, DATE(clicked_at) AS date, COUNT(*) AS click_count
      FROM clicks
      WHERE DATE(clicked_at) = CURRENT_DATE - INTERVAL '1 day'
      GROUP BY slug, DATE(clicked_at)
      ON CONFLICT (slug, date)
      DO UPDATE SET click_count = EXCLUDED.click_count
    `);
    console.log('Click worker: daily aggregation complete');
  } catch (err) {
    console.error('Click worker aggregation error:', err);
  }
}

// --- Helper: schedule a job to run at midnight ---
function scheduleAtMidnight(job) {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // next midnight
  const msUntilMidnight = midnight - now;

  console.log(`Daily aggregation scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

  // run once at midnight, then every 24h
  setTimeout(() => {
    job();
    setInterval(job, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

// --- Start worker: drain queue on interval + aggregate daily at midnight ---
function startClickWorker() {
  console.log(`Click worker started — draining every ${DRAIN_INTERVAL_MS / 1000}s`);
  setInterval(drainClickQueue, DRAIN_INTERVAL_MS);
  scheduleAtMidnight(aggregateDailyClicks);
}

module.exports = { startClickWorker };