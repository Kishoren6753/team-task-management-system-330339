'use strict';

const { v4: uuidv4 } = require('uuid');

const tasksRepo = require('../repositories/tasksRepo');
const { HttpError } = require('../utils/httpErrors');

class TasksController {
  // PUBLIC_INTERFACE
  async listForProject(req, res, next) {
    /** Lists tasks for a project with filters. */
    try {
      const {
        status,
        priority,
        assignedTo,
        dueBefore,
        dueAfter,
        q,
        limit,
        offset,
      } = req.query || {};

      const items = await tasksRepo.listTasksForProject(req.params.projectId, {
        status,
        priority,
        assignedTo,
        dueBefore,
        dueAfter,
        q,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });
      return res.status(200).json({ items });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Creates a new task in a project. */
    try {
      const { title, description, status, priority, startDate, dueDate, assignedToUserId } = req.body || {};
      if (!title) {
        throw new HttpError(400, 'title is required');
      }

      const task = await tasksRepo.createTask({
        id: uuidv4(),
        projectId: req.params.projectId,
        createdByUserId: req.user.id,
        title,
        description,
        status,
        priority,
        startDate,
        dueDate,
        assignedToUserId,
      });
      return res.status(201).json(task);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res, next) {
    /** Gets a task by id. */
    try {
      const task = await tasksRepo.getTaskById(req.params.taskId);
      if (!task) {
        throw new HttpError(404, 'Task not found');
      }
      return res.status(200).json(task);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Updates a task by id. */
    try {
      const updated = await tasksRepo.updateTask(req.params.taskId, req.body || {});
      if (!updated) {
        throw new HttpError(404, 'Task not found');
      }
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Deletes a task by id. */
    try {
      const ok = await tasksRepo.deleteTask(req.params.taskId);
      if (!ok) {
        throw new HttpError(404, 'Task not found');
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TasksController();
