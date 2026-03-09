'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const usersRepo = require('../repositories/usersRepo');
const { signAccessToken } = require('../utils/jwt');
const { HttpError } = require('../utils/httpErrors');

function toAuthResponse(user) {
  const token = signAccessToken({ sub: user.id, email: user.email });
  return {
    accessToken: token,
    tokenType: 'Bearer',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  };
}

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res, next) {
    /** Registers a new user and returns a JWT. */
    try {
      const { email, password, fullName } = req.body || {};
      if (!email || !password) {
        throw new HttpError(400, 'email and password are required');
      }
      if (String(password).length < 8) {
        throw new HttpError(400, 'password must be at least 8 characters');
      }

      const existing = await usersRepo.findByEmail(email);
      if (existing) {
        throw new HttpError(409, 'Email is already registered');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await usersRepo.createUser({
        id: uuidv4(),
        email,
        passwordHash,
        fullName: fullName || null,
      });

      return res.status(201).json(toAuthResponse(user));
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Logs in and returns a JWT. */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        throw new HttpError(400, 'email and password are required');
      }

      const user = await usersRepo.findByEmail(email);
      if (!user || !user.is_active) {
        throw new HttpError(401, 'Invalid credentials');
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        throw new HttpError(401, 'Invalid credentials');
      }

      return res.status(200).json(toAuthResponse(user));
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
