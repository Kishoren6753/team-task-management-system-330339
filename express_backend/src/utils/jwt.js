'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

// PUBLIC_INTERFACE
function signAccessToken(payload) {
  /** Signs an access token for authenticated API usage. */
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// PUBLIC_INTERFACE
function verifyAccessToken(token) {
  /** Verifies an access token and returns decoded claims. Throws if invalid/expired. */
  return jwt.verify(token, config.jwt.secret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
