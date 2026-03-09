'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboard');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Aggregated dashboard data
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     summary: Get dashboard summary
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
router.get('/', requireAuth, dashboardController.getSummary.bind(dashboardController));

module.exports = router;
