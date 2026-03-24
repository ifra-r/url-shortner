const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');
const rateLimiter = require('../middleware/rateLimiter');
const { getAnalytics } = require('../controllers/analytics.controller');


/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUrlRequest:
 *       type: object
 *       required:
 *         - originalUrl
 *       properties:
 *         originalUrl:
 *           type: string
 *           example: https://www.google.com
 *         alias:
 *           type: string
 *           example: mylink
 *           description: Optional custom alias (1-10 alphanumeric chars)
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: 2026-12-31T23:59:59Z
 *           description: Optional expiry datetime, defaults to 30 days
 *
 *     CreateUrlResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         shortUrl:
 *           type: string
 *           example: https://your-app.railway.app/mylink
 *         originalUrl:
 *           type: string
 *           example: https://www.google.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AnalyticsResponse:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *           example: mylink
 *         totalClicks:
 *           type: integer
 *           example: 42
 *         clicksPerDay:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 example: 2026-03-24
 *               count:
 *                 type: integer
 *                 example: 10
 *         topIPs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *                 example: 192.168.1.1
 *               count:
 *                 type: integer
 *                 example: 5
 *         recentClicks:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *             page:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Short URL not found.
 */

/**
 * @swagger
 * /api/urls:
 *   post:
 *     summary: Create a shortened URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUrlRequest'
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUrlResponse'
 *       400:
 *         description: Missing or invalid URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Alias already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /{slug}:
 *   get:
 *     summary: Redirect to original URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: mylink
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: Slug not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       410:
 *         description: URL has expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/urls/{slug}/analytics:
 *   get:
 *     summary: Get analytics for a shortened URL
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: mylink
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for recent clicks pagination
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsResponse'
 *       404:
 *         description: Slug not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

// POST /api/urls — Create a shortened URL
router.post('/',rateLimiter, urlController.createUrl);

// GET /:slug → redirect to original URL
router.get('/:slug',rateLimiter, urlController.redirectUrl);

// GET /api/urls/:slug/analytics — fetch analytics for a slug
router.get('/:slug/analytics', getAnalytics);

module.exports = router;