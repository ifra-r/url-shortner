const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');

const rateLimiter = require('../middleware/rateLimiter');

// POST /api/urls — Create a shortened URL
router.post('/',rateLimiter, urlController.createUrl);

// GET /:slug → redirect to original URL
router.get('/:slug',rateLimiter, urlController.redirectUrl);

module.exports = router;