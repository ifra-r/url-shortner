const pool = require("./db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_url VARCHAR(10) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    // send SQL to PostgreSQL
    await pool.query(query);
    console.log("Table created or already exists");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createTable();