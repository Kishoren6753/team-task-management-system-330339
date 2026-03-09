const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const projectsRoutes = require('./projects');
const tasksRoutes = require('./tasks');
const dashboardRoutes = require('./dashboard');
const searchRoutes = require('./search');

const router = express.Router();
// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Domain routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);

module.exports = router;
