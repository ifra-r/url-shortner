const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');

// POST /api/urls — Create a shortened URL
router.post('/', urlController.createUrl);

// GET /:slug → redirect to original URL
router.get('/:slug', urlController.redirectUrl);

module.exports = router;