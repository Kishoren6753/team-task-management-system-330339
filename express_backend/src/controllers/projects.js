'use strict';

const { v4: uuidv4 } = require('uuid');

const projectsRepo = require('../repositories/projectsRepo');
const usersRepo = require('../repositories/usersRepo');
const { HttpError } = require('../utils/httpErrors');

class ProjectsController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** Lists projects for the current user. */
    try {
      const { status, q, limit, offset } = req.query || {};
      const rows = await projectsRepo.listProjectsForUser(req.user.id, {
        status,
        q,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });
      return res.status(200).json({ items: rows });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Creates a project and makes the creator the owner. */
    try {
      const { name, description } = req.body || {};
      if (!name) {
        throw new HttpError(400, 'name is required');
      }
      const project = await projectsRepo.createProject({
        id: uuidv4(),
        ownerUserId: req.user.id,
        name,
        description,
      });
      return res.status(201).json(project);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res, next) {
    /** Gets a project by id. */
    try {
      const project = await projectsRepo.getProjectById(req.params.projectId);
      if (!project) {
        throw new HttpError(404, 'Project not found');
      }
      return res.status(200).json(project);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Updates a project (name/description/status). */
    try {
      const { name, description, status } = req.body || {};
      const updated = await projectsRepo.updateProject(req.params.projectId, { name, description, status });
      if (!updated) {
        throw new HttpError(404, 'Project not found');
      }
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Deletes a project. */
    try {
      const ok = await projectsRepo.deleteProject(req.params.projectId);
      if (!ok) {
        throw new HttpError(404, 'Project not found');
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async listMembers(req, res, next) {
    /** Lists members of a project. */
    try {
      const members = await projectsRepo.listMembers(req.params.projectId);
      return res.status(200).json({ items: members });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async addMember(req, res, next) {
    /** Adds a member to a project by email and assigns a role. */
    try {
      const { email, role } = req.body || {};
      if (!email || !role) {
        throw new HttpError(400, 'email and role are required');
      }

      const user = await usersRepo.findByEmail(email);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      const membership = await projectsRepo.addMember(req.params.projectId, user.id, role);
      return res.status(200).json(membership);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async removeMember(req, res, next) {
    /** Removes a member from a project. */
    try {
      const ok = await projectsRepo.removeMember(req.params.projectId, req.params.userId);
      if (!ok) {
        throw new HttpError(404, 'Membership not found');
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ProjectsController();
