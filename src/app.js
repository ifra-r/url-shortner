// entry point

// Load environment variables from .env
// Set up Express and JSON body parsing middleware.
require('dotenv').config();
const express = require('express');
const app = express(); 
app.use(express.json());        // parse JSON request bodies

// Routes

// Mount URL routes under /api/urls
// POST /api/urls → API to create short URL
const urlRoutes = require('./routes/url.routes');
app.use('/api/urls', urlRoutes);


// GET /:slug → redirect to original URL
app.use('/', require('./routes/url.routes'));

// Start server ===? use port from env var ==> else use 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;       // export app obj