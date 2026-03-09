'use strict';

const bcrypt = require('bcryptjs');

const usersRepo = require('../repositories/usersRepo');
const { HttpError } = require('../utils/httpErrors');

class ProfileController {
  // PUBLIC_INTERFACE
  async me(req, res, next) {
    /** Returns the authenticated user's profile. */
    try {
      const user = await usersRepo.findById(req.user.id);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }
      return res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async updateMe(req, res, next) {
    /** Updates authenticated user's profile (currently: fullName). */
    try {
      const { fullName } = req.body || {};
      if (fullName !== undefined && String(fullName).trim().length === 0) {
        throw new HttpError(400, 'fullName cannot be empty');
      }
      const updated = await usersRepo.updateProfile(req.user.id, { fullName: fullName ?? null });
      if (!updated) {
        throw new HttpError(404, 'User not found');
      }
      return res.status(200).json({
        id: updated.id,
        email: updated.email,
        fullName: updated.full_name,
        isActive: updated.is_active,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async changePassword(req, res, next) {
    /** Changes authenticated user's password. */
    try {
      const { currentPassword, newPassword } = req.body || {};
      if (!currentPassword || !newPassword) {
        throw new HttpError(400, 'currentPassword and newPassword are required');
      }
      if (String(newPassword).length < 8) {
        throw new HttpError(400, 'newPassword must be at least 8 characters');
      }

      const user = await usersRepo.findByEmail(req.user.email);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      const ok = await bcrypt.compare(currentPassword, user.password_hash);
      if (!ok) {
        throw new HttpError(400, 'currentPassword is incorrect');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await usersRepo.updatePasswordHash(req.user.id, passwordHash);

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ProfileController();
