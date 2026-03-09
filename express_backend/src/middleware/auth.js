'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { HttpError } = require('../utils/httpErrors');

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  /** Express middleware that requires a Bearer JWT and populates req.user. */
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };
    return next();
  } catch (err) {
    return next(new HttpError(401, 'Unauthorized'));
  }
}

module.exports = {
  requireAuth,
};
