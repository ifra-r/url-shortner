const pool = require("./db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_url VARCHAR(10) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(10) NOT NULL,
      clicked_at TIMESTAMP DEFAULT NOW(),
      ip TEXT,
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS clicks_daily (
      slug VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      click_count INT DEFAULT 0,
      PRIMARY KEY (slug, date)
    );
  `;
  try {
    // send SQL to PostgreSQL
    await pool.query(query);
    console.log("All tables created or already exist");
    // removed process.exit() — so app keeps running after setup
  } catch (err) {
    console.error("DB setup error:", err);
    throw err; // let app.js handle the failure
  }
};

module.exports = { createTable };