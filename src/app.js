// entry point

// Start server ===? use port from env var ==> else use 3000
const PORT = process.env.PORT || 5000;    // was 3000

// Load environment variables from .env
// Set up Express and JSON body parsing middleware.
require('dotenv').config();
const express = require('express');
const app = express(); 
app.use(express.json());        // parse JSON request bodies
const { startClickWorker } = require('./workers/clickWorker');

const { createTable } = require('./dbSetup');
const cors = require('cors');

// on startup --> call create table
app.listen(PORT, async () => {
  await createTable();
  console.log(`Server running on port ${PORT}`);
  startClickWorker();
});


// alow req form frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS not allowed'));
  },
}));

// const rateLimiter = require('./middleware/rateLimiter');
// //  every request hits the rate limiter first
// // // apply rate limiting to certain routes 
// // router.post('/', rateLimiter, createUrl);
// // router.get('/:slug', rateLimiter, redirectUrl);
// app.use(rateLimiter);   // globally used so effects all routes but can be applied to only post and get if needed


// Routes ========
// Mount URL routes under /api/urls
// POST /api/urls → API to create short URL
const urlRoutes = require('./routes/url.routes');
app.use('/api/urls', urlRoutes);


// GET /:slug → redirect to original URL
app.use('/', require('./routes/url.routes'));


// const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // start async click tracking worker once server is up
  startClickWorker();
});

module.exports = app;       // export app obj