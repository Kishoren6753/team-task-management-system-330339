'use strict';

const { Pool } = require('pg');
const config = require('../config');

function safeParsePgUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function buildPoolConfig() {
  /**
   * Build a pg.Pool config from the database container contract.
   *
   * Prefer POSTGRES_URL if present; it may be a full connection string or a URL
   * that just provides host/port/db. If it cannot be used as a full connection
   * string (e.g., missing auth), fall back to discrete env vars while still
   * deriving host/port/db from the URL where possible.
   */
  const url = config.postgres.url;
  const parsed = url ? safeParsePgUrl(url) : null;

  // If POSTGRES_URL includes username/password, pg can use it directly.
  if (parsed && parsed.username && parsed.password) {
    return { connectionString: url };
  }

  // Otherwise, use discrete env vars but derive host/port/db from POSTGRES_URL if available.
  const hostFromUrl = parsed ? parsed.hostname : null;
  const portFromUrl = parsed && parsed.port ? Number(parsed.port) : null;
  const dbFromUrl = parsed ? parsed.pathname.replace(/^\//, '') : null;

  return {
    host: hostFromUrl || process.env.POSTGRES_HOST || 'localhost',
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database || dbFromUrl || undefined,
    port: config.postgres.port || portFromUrl || undefined,
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = pool;
