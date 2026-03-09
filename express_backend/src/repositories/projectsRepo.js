'use strict';

const db = require('../db');

// PUBLIC_INTERFACE
async function createProject({ id, ownerUserId, name, description }) {
  /** Creates a project and assigns owner membership. */
  return db.withTransaction(async (client) => {
    const { rows: projectRows } = await client.query(
      `INSERT INTO projects (id, owner_user_id, name, description, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, owner_user_id, name, description, status, created_at, updated_at`,
      [id, ownerUserId, name, description || null]
    );

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [id, ownerUserId]
    );

    return projectRows[0];
  });
}

// PUBLIC_INTERFACE
async function getProjectById(projectId) {
  /** Gets a project by id. */
  const { rows } = await db.query(
    `SELECT id, owner_user_id, name, description, status, created_at, updated_at
     FROM projects
     WHERE id = $1`,
    [projectId]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function listProjectsForUser(userId, { status, q, limit = 50, offset = 0 }) {
  /** Lists projects the user is a member of, with optional status & text search. */
  const params = [userId];
  const where = ['pm.user_id = $1'];

  if (status) {
    params.push(status);
    where.push(`p.status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.name ILIKE $${params.length} OR coalesce(p.description, '') ILIKE $${params.length})`);
  }

  params.push(limit);
  params.push(offset);

  const { rows } = await db.query(
    `SELECT p.id, p.owner_user_id, p.name, p.description, p.status, p.created_at, p.updated_at,
            pm.role AS my_role
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE ${where.join(' AND ')}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

// PUBLIC_INTERFACE
async function updateProject(projectId, { name, description, status }) {
  /** Updates project fields. */
  const { rows } = await db.query(
    `UPDATE projects
     SET name = coalesce($2, name),
         description = coalesce($3, description),
         status = coalesce($4, status),
         updated_at = now()
     WHERE id = $1
     RETURNING id, owner_user_id, name, description, status, created_at, updated_at`,
    [projectId, name || null, description === undefined ? null : description, status || null]
  );
  return rows[0] || null;
}

// PUBLIC_INTERFACE
async function deleteProject(projectId) {
  /** Deletes a project (cascades to tasks/members by FK constraints). */
  const result = await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
  return result.rowCount > 0;
}

// PUBLIC_INTERFACE
async function addMember(projectId, userId, role) {
  /** Adds or updates a membership. */
  const { rows } = await db.query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id)
     DO UPDATE SET role = EXCLUDED.role
     RETURNING project_id, user_id, role`,
    [projectId, userId, role]
  );
  return rows[0];
}

// PUBLIC_INTERFACE
async function removeMember(projectId, userId) {
  /** Removes a member from the project. */
  const result = await db.query(
    'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rowCount > 0;
}

// PUBLIC_INTERFACE
async function listMembers(projectId) {
  /** Lists members for a project. */
  const { rows } = await db.query(
    `SELECT pm.user_id, pm.role, u.email, u.full_name
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.role, u.email`,
    [projectId]
  );
  return rows;
}

module.exports = {
  createProject,
  getProjectById,
  listProjectsForUser,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  listMembers,
};
