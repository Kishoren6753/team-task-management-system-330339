'use strict';

const { Pool } = require('pg');
const config = require('../config');

function buildPoolConfig() {
  // Prefer POSTGRES_URL if provided; otherwise use discrete fields.
  if (config.postgres.url) {
    return {
      connectionString: config.postgres.url,
    };
  }

  return {
    host: 'localhost',
    // In the Kavia environment, db is exposed via env; we only fall back for local dev.
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    port: config.postgres.port,
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = pool;
