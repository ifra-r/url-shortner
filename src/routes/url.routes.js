const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');
const rateLimiter = require('../middleware/rateLimiter');
const { getAnalytics } = require('../controllers/analytics.controller');


// POST /api/urls — Create a shortened URL
router.post('/',rateLimiter, urlController.createUrl);

// GET /:slug → redirect to original URL
router.get('/:slug',rateLimiter, urlController.redirectUrl);

// GET /api/urls/:slug/analytics — fetch analytics for a slug
router.get('/:slug/analytics', getAnalytics);

module.exports = router;