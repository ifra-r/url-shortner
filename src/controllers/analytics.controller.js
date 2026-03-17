// This file exposes a single endpoint: /api/urls/:slug/analytics. It fetches all the analytics data in parallel and returns it.

const pool = require('../db');
const {
  getTotalClicks,
  getClicksPerDay,
  getTopIPs,
  getRecentClicks,
} = require('../utils/analyticsHelpers');

// GET /api/urls/:slug/analytics — fetch analytics for a slug
const getAnalytics = async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;

  try {
    // verify slug exists
    const slugCheck = await pool.query(
      'SELECT id FROM urls WHERE short_url = $1',
      [slug]
    );
    if (slugCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    // fetch all analytics data in parallel
    const [totalClicks, clicksPerDay, topIPs, recentClicks] = await Promise.all([
      getTotalClicks(slug, pool),
      getClicksPerDay(slug, pool),
      getTopIPs(slug, pool),
      getRecentClicks(slug, page, pool),
    ]);

    return res.status(200).json({
      slug,
      totalClicks,
      clicksPerDay,
      topIPs,
      recentClicks,
    });

  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getAnalytics };