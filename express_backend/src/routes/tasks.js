'use strict';

const express = require('express');
const tasksController = require('../controllers/tasks');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task CRUD by task id
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Get task by id
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task
 *       404:
 *         description: Not found
 */
router.get('/:taskId', requireAuth, tasksController.getById.bind(tasksController));

/**
 * @swagger
 * /tasks/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Update task by id
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in_progress, blocked, done, archived] }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               assignedToUserId: { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:taskId', requireAuth, tasksController.update.bind(tasksController));

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete task by id
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:taskId', requireAuth, tasksController.remove.bind(tasksController));

module.exports = router;
