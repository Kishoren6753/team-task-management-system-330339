'use strict';

const db = require('../db');
const { HttpError } = require('../utils/httpErrors');

async function getMembership(projectId, userId) {
  const { rows } = await db.query(
    `SELECT role
     FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
function requireProjectRole(allowedRoles) {
  /**
   * Express middleware factory to require project membership with one of allowedRoles.
   * Expects `:projectId` in route params.
   */
  return async function requireProjectRoleMiddleware(req, res, next) {
    try {
      const projectId = req.params.projectId;
      if (!projectId) {
        throw new HttpError(400, 'Missing projectId parameter');
      }
      const membership = await getMembership(projectId, req.user.id);
      if (!membership) {
        throw new HttpError(403, 'Not a project member');
      }
      if (!allowedRoles.includes(membership.role)) {
        throw new HttpError(403, 'Insufficient project role');
      }
      req.projectMembership = membership;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  requireProjectRole,
};
