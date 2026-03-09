'use strict';

const express = require('express');

const projectsController = require('../controllers/projects');
const tasksController = require('../controllers/tasks');
const { requireAuth } = require('../middleware/auth');
const { requireProjectRole } = require('../middleware/projectAccess');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project CRUD and membership
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: List my projects
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Projects list
 */
router.get('/', requireAuth, projectsController.list.bind(projectsController));

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireAuth, projectsController.create.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Get project by id
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project
 *       404:
 *         description: Not found
 */
router.get('/:projectId', requireAuth, requireProjectRole(['owner', 'admin', 'member', 'viewer']), projectsController.getById.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Update project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [active, archived] }
 *     responses:
 *       200:
 *         description: Updated project
 */
router.patch('/:projectId', requireAuth, requireProjectRole(['owner', 'admin']), projectsController.update.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:projectId', requireAuth, requireProjectRole(['owner']), projectsController.remove.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}/members:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: List project members
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Members
 */
router.get('/:projectId/members', requireAuth, requireProjectRole(['owner', 'admin', 'member', 'viewer']), projectsController.listMembers.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Add or update a member role
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email: { type: string }
 *               role: { type: string, enum: [owner, admin, member, viewer] }
 *     responses:
 *       200:
 *         description: Membership upserted
 */
router.post('/:projectId/members', requireAuth, requireProjectRole(['owner', 'admin']), projectsController.addMember.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Remove a member
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Removed
 */
router.delete('/:projectId/members/:userId', requireAuth, requireProjectRole(['owner', 'admin']), projectsController.removeMember.bind(projectsController));

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: List tasks in a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Tasks list
 */
router.get('/:projectId/tasks', requireAuth, requireProjectRole(['owner', 'admin', 'member', 'viewer']), tasksController.listForProject.bind(tasksController));

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a task in a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in_progress, blocked, done, archived] }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               assignedToUserId: { type: string, format: uuid, nullable: true }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/:projectId/tasks', requireAuth, requireProjectRole(['owner', 'admin', 'member']), tasksController.create.bind(tasksController));

module.exports = router;
