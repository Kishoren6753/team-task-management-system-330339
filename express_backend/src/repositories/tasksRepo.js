'use strict';

const db = require('../db');

// PUBLIC_INTERFACE
async function createTask({
  id,
  projectId,
  createdByUserId,
  title,
  description,
  status,
  priority,
  startDate,
  dueDate,
  assignedToUserId,
}) {
  /** Creates a task in a project. */
  const { rows } = await db.query(
    `INSERT INTO tasks (
        id, project_id, created_by_user_id,
        assigned_to_user_id,
        title, description,
        status, priority,
        start_date, due_date
     )
     VALUES (
        $1, $2, $3,
        $4,
        $5, $6,
        $7, $8,
        $9, $10
     )
     RETURNING id, project_id, created_by_user_id, assigned_to_user_id,
               title, description, status, priority, start_date, due_date,
               completed_at, created_at, updated_at`,
    [
      id,
      projectId,
      createdByUserId,
      assignedToUserId || null,
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      startDate || null,
      dueDate || null,
    ]
  );
  return rows[0];
}

// PUBLIC_INTERFACE
async function getTaskById(taskId) {
  /** Gets a task by id. */
  const { rows } = await db.query(
    `SELECT id, project_id, created_by_user_id, assigned_to_user_id,
            title, description, status, priority, start_date, due_date,
            completed_at, created_at, updated_at
     FROM tasks
     WHERE id = $1`,
    [taskId]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function listTasksForProject(projectId, filters) {
  /** Lists tasks for a project with filters/search/sort/pagination. */
  const {
    status,
    priority,
    assignedTo,
    dueBefore,
    dueAfter,
    q,
    limit = 50,
    offset = 0,
  } = filters || {};

  const params = [projectId];
  const where = ['t.project_id = $1'];

  if (status) {
    params.push(status);
    where.push(`t.status = $${params.length}`);
  }
  if (priority) {
    params.push(priority);
    where.push(`t.priority = $${params.length}`);
  }
  if (assignedTo) {
    params.push(assignedTo);
    where.push(`t.assigned_to_user_id = $${params.length}`);
  }
  if (dueBefore) {
    params.push(dueBefore);
    where.push(`t.due_date <= $${params.length}`);
  }
  if (dueAfter) {
    params.push(dueAfter);
    where.push(`t.due_date >= $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(t.title ILIKE $${params.length} OR coalesce(t.description,'') ILIKE $${params.length})`);
  }

  params.push(limit);
  params.push(offset);

  const { rows } = await db.query(
    `SELECT t.id, t.project_id, t.created_by_user_id, t.assigned_to_user_id,
            t.title, t.description, t.status, t.priority, t.start_date, t.due_date,
            t.completed_at, t.created_at, t.updated_at
     FROM tasks t
     WHERE ${where.join(' AND ')}
     ORDER BY t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return rows;
}

// PUBLIC_INTERFACE
async function updateTask(taskId, patch) {
  /** Updates task fields; sets completed_at when status becomes done. */
  const {
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    assignedToUserId,
  } = patch;

  const { rows } = await db.query(
    `UPDATE tasks
     SET title = coalesce($2, title),
         description = coalesce($3, description),
         status = coalesce($4, status),
         priority = coalesce($5, priority),
         start_date = coalesce($6, start_date),
         due_date = coalesce($7, due_date),
         assigned_to_user_id = $8,
         completed_at = CASE
            WHEN coalesce($4, status) = 'done' THEN coalesce(completed_at, now())
            ELSE NULL
         END,
         updated_at = now()
     WHERE id = $1
     RETURNING id, project_id, created_by_user_id, assigned_to_user_id,
               title, description, status, priority, start_date, due_date,
               completed_at, created_at, updated_at`,
    [
      taskId,
      title || null,
      description === undefined ? null : description,
      status || null,
      priority || null,
      startDate || null,
      dueDate || null,
      assignedToUserId === undefined ? null : assignedToUserId,
    ]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function deleteTask(taskId) {
  /** Deletes a task. */
  const result = await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  return result.rowCount > 0;
}

module.exports = {
  createTask,
  getTaskById,
  listTasksForProject,
  updateTask,
  deleteTask,
};
