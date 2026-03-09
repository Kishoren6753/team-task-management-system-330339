'use strict';

const express = require('express');
const searchController = require('../controllers/search');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Search
 *     description: Search and filter across projects and tasks visible to the user
 */

/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     summary: Search projects and tasks
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Text query
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [projects, tasks] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Task status filter (tasks only)
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *         description: Task priority filter (tasks only)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', requireAuth, searchController.search.bind(searchController));

module.exports = router;
