'use strict';

const pool = require('./pool');

/**
 * Runs a SQL query with parameters.
 * @param {string} text SQL text
 * @param {any[]} params query parameters
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

/**
 * Runs a series of statements in a transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn callback executed within BEGIN/COMMIT
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  withTransaction,
  pool,
};
