'use strict';

// This file exports middleware as the application grows
const { requireAuth } = require('./auth');
const { requireProjectRole } = require('./projectAccess');

module.exports = {
  requireAuth,
  requireProjectRole,
};
