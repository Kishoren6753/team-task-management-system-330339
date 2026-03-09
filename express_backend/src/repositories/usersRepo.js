'use strict';

const db = require('../db');

// PUBLIC_INTERFACE
async function findByEmail(email) {
  /** Finds a user by email (case-insensitive). */
  const { rows } = await db.query(
    `SELECT id, email, password_hash, full_name, is_active, created_at, updated_at
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function findById(userId) {
  /** Finds a user by id. */
  const { rows } = await db.query(
    `SELECT id, email, full_name, is_active, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function createUser({ id, email, passwordHash, fullName }) {
  /** Creates a user row. */
  const { rows } = await db.query(
    `INSERT INTO users (id, email, password_hash, full_name, is_active)
     VALUES ($1, lower($2), $3, $4, true)
     RETURNING id, email, full_name, is_active, created_at, updated_at`,
    [id, email, passwordHash, fullName]
  );
  return rows[0];
}

// PUBLIC_INTERFACE
async function updateProfile(userId, { fullName }) {
  /** Updates profile fields for a user. */
  const { rows } = await db.query(
    `UPDATE users
     SET full_name = $2,
         updated_at = now()
     WHERE id = $1
     RETURNING id, email, full_name, is_active, created_at, updated_at`,
    [userId, fullName]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function updatePasswordHash(userId, passwordHash) {
  /** Updates password hash. */
  const { rows } = await db.query(
    `UPDATE users
     SET password_hash = $2,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [userId, passwordHash]
  );
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  updatePasswordHash,
};
