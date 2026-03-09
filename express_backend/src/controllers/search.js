'use strict';

const db = require('../db');

class SearchController {
  // PUBLIC_INTERFACE
  async search(req, res, next) {
    /** Searches projects and tasks visible to the current user. */
    try {
      const userId = req.user.id;
      const { q, type, status, priority, limit, offset } = req.query || {};
      const lim = limit ? Number(limit) : 20;
      const off = offset ? Number(offset) : 0;

      const queryText = q ? `%${q}%` : null;

      const results = {
        'projects': [],
        'tasks': [],
      };

      if (!type || type === 'projects') {
        const params = [userId];
        const where = ['pm.user_id = $1'];
        if (queryText) {
          params.push(queryText);
          where.push(`(p.name ILIKE $${params.length} OR coalesce(p.description,'') ILIKE $${params.length})`);
        }
        params.push(lim);
        params.push(off);

        const { rows } = await db.query(
          `SELECT p.id, p.name, p.description, p.status, p.created_at, p.updated_at
           FROM projects p
           JOIN project_members pm ON pm.project_id = p.id
           WHERE ${where.join(' AND ')}
           ORDER BY p.created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );
        results.projects = rows;
      }

      if (!type || type === 'tasks') {
        const params = [userId];
        const where = ['pm.user_id = $1'];

        if (queryText) {
          params.push(queryText);
          where.push(`(t.title ILIKE $${params.length} OR coalesce(t.description,'') ILIKE $${params.length})`);
        }
        if (status) {
          params.push(status);
          where.push(`t.status = $${params.length}`);
        }
        if (priority) {
          params.push(priority);
          where.push(`t.priority = $${params.length}`);
        }

        params.push(lim);
        params.push(off);

        const { rows } = await db.query(
          `SELECT t.id, t.project_id, t.title, t.status, t.priority, t.due_date, t.assigned_to_user_id,
                  p.name AS project_name
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           JOIN project_members pm ON pm.project_id = p.id
           WHERE ${where.join(' AND ')}
           ORDER BY t.created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );
        results.tasks = rows;
      }

      return res.status(200).json(results);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new SearchController();
