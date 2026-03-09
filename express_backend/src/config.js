'use strict';

/**
 * Centralized runtime configuration. Do not hardcode secrets.
 *
 * Required env vars:
 * - POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT
 * - JWT_SECRET
 *
 * Optional:
 * - JWT_EXPIRES_IN (default: 7d)
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    // Fail fast: without these variables the API cannot operate correctly.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3000),

  // PostgreSQL: use discrete env vars from the database container contract.
  postgres: {
    url: process.env.POSTGRES_URL || null,
    user: process.env.POSTGRES_USER || null,
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB || null,
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : null,
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

module.exports = config;
