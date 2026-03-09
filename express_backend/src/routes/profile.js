'use strict';

const express = require('express');
const profileController = require('../controllers/profile');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: User profile endpoints
 */

/**
 * @swagger
 * /profile/me:
 *   get:
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, profileController.me.bind(profileController));

/**
 * @swagger
 * /profile/me:
 *   patch:
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated profile
 *       401:
 *         description: Unauthorized
 */
router.patch('/me', requireAuth, profileController.updateMe.bind(profileController));

/**
 * @swagger
 * /profile/me/password:
 *   post:
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       204:
 *         description: Password changed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/me/password', requireAuth, profileController.changePassword.bind(profileController));

module.exports = router;
