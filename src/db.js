const { Pool } = require("pg");     // PostgreSQL driver for Node.
require("dotenv").config();         // Loads .env file --> defines process.env.DATABASE_URL

// connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// This tests the connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("DB connection error:", err));

module.exports = pool;      // export pool obj so other files can use it n run queries