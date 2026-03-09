'use strict';

const db = require('../db');

class DashboardController {
  // PUBLIC_INTERFACE
  async getSummary(req, res, next) {
    /** Aggregates dashboard summary for the authenticated user. */
    try {
      const userId = req.user.id;

      const { rows: projectCountRows } = await db.query(
        `SELECT COUNT(*)::int AS count
         FROM project_members pm
         JOIN projects p ON p.id = pm.project_id
         WHERE pm.user_id = $1 AND p.status <> 'archived'`,
        [userId]
      );

      const { rows: myTaskRows } = await db.query(
        `SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'todo')::int AS todo,
            COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
            COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked,
            COUNT(*) FILTER (WHERE status = 'done')::int AS done
         FROM tasks
         WHERE assigned_to_user_id = $1`,
        [userId]
      );

      const { rows: dueSoonRows } = await db.query(
        `SELECT COUNT(*)::int AS count
         FROM tasks
         WHERE assigned_to_user_id = $1
           AND status IN ('todo','in_progress','blocked')
           AND due_date IS NOT NULL
           AND due_date <= (now() + interval '7 days')`,
        [userId]
      );

      return res.status(200).json({
        projects: {
          activeCount: projectCountRows[0]?.count || 0,
        },
        myTasks: myTaskRows[0] || { total: 0, todo: 0, in_progress: 0, blocked: 0, done: 0 },
        dueSoon: {
          count: dueSoonRows[0]?.count || 0,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new DashboardController();
