// fetching data from PostgreSQL to power the analytics endpoint.

const ITEMS_PER_PAGE = 20;      //raw clicks per page

// --- Helper: fetch total clicks for a slug ---
async function getTotalClicks(slug, pool) {
  const result = await pool.query(
    'SELECT COUNT(*) AS total FROM clicks WHERE slug = $1',
    [slug]
  );
  return parseInt(result.rows[0].total);
}

// --- Helper: fetch clicks per day for a slug ---
async function getClicksPerDay(slug, pool) {
  const result = await pool.query(
    `SELECT DATE(clicked_at) AS date, COUNT(*) AS count
     FROM clicks
     WHERE slug = $1
     GROUP BY DATE(clicked_at)
     ORDER BY date DESC`,
    [slug]
  );
  return result.rows;
}

// --- Helper: fetch top IPs for a slug ---
async function getTopIPs(slug, pool) {
  const result = await pool.query(
    `SELECT ip, COUNT(*) AS count
     FROM clicks
     WHERE slug = $1 AND ip IS NOT NULL
     GROUP BY ip
     ORDER BY count DESC
     LIMIT 10`,
    [slug]
  );
  return result.rows;
}

// --- fetch paginated raw clicks for a slug ---
async function getRecentClicks(slug, page = 1, pool) {
  const offset = (page - 1) * ITEMS_PER_PAGE;

//   Promise.all to get data + total count in parallel → faster than sequential queries.
  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ip, user_agent, clicked_at
       FROM clicks
       WHERE slug = $1
       ORDER BY clicked_at DESC
       LIMIT $2 OFFSET $3`,
      [slug, ITEMS_PER_PAGE, offset]
    ),
    pool.query(
      'SELECT COUNT(*) AS total FROM clicks WHERE slug = $1',
      [slug]
    ),
  ]);

  const total = parseInt(countResult.rows[0].total);

  return {
    data: dataResult.rows,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

module.exports = { getTotalClicks, getClicksPerDay, getTopIPs, getRecentClicks };