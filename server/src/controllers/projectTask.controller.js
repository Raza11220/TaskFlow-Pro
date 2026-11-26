import ProjectService from '../services/project.service.js';
import TaskService from '../services/task.service.js';
import KanbanService from '../services/kanban.service.js';
import CycleService from '../services/cycle.service.js';
import CommentService from '../services/comment.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export class ProjectTaskController {
  // Projects
  static async createProject(req, res, next) {
    try {
      const project = await ProjectService.createProject(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Project created successfully', { project }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req, res, next) {
    try {
      const result = await ProjectService.getProjects(req.params.organizationId, req.query);
      return sendPaginated(res, result.projects, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }, 'Projects retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req, res, next) {
    try {
      const project = await ProjectService.getProjectById(req.params.organizationId, req.params.projectId);
      return sendSuccess(res, 'Project retrieved', { project });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const project = await ProjectService.updateProject(
        req.params.organizationId,
        req.params.projectId,
        req.body,
        req.user._id
      );
      return sendSuccess(res, 'Project updated', { project });
    } catch (error) {
      next(error);
    }
  }

  static async archiveProject(req, res, next) {
    try {
      const project = await ProjectService.archiveProject(
        req.params.organizationId,
        req.params.projectId,
        req.user._id
      );
      return sendSuccess(res, 'Project archived', { project });
    } catch (error) {
      next(error);
    }
  }

  static async restoreProject(req, res, next) {
    try {
      const project = await ProjectService.restoreProject(
        req.params.organizationId,
        req.params.projectId,
        req.user._id
      );
      return sendSuccess(res, 'Project restored', { project });
    } catch (error) {
      next(error);
    }
  }

  // Tasks
  static async createTask(req, res, next) {
    try {
      const task = await TaskService.createTask(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Task created successfully', { task }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req, res, next) {
    try {
      const result = await TaskService.getTasks(req.params.organizationId, req.query);
      return sendPaginated(res, result.tasks, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }, 'Tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req, res, next) {
    try {
      const task = await TaskService.getTaskById(req.params.organizationId, req.params.taskId);
      return sendSuccess(res, 'Task retrieved', { task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const task = await TaskService.updateTask(
        req.params.organizationId,
        req.params.taskId,
        req.body,
        req.user._id
      );
      return sendSuccess(res, 'Task updated', { task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req, res, next) {
    try {
      const bypassReview = req.organization?.settings?.allowEmployeeReviewBypass || false;
      const task = await TaskService.updateTaskStatus(
        req.params.organizationId,
        req.params.taskId,
        req.body.status,
        req.user._id,
        req.userRole,
        bypassReview
      );
      return sendSuccess(res, 'Task status updated', { task });
    } catch (error) {
      next(error);
    }
  }

  static async moveTask(req, res, next) {
    try {
      const task = await TaskService.moveTask(
        req.params.organizationId,
        req.params.taskId,
        req.body,
        req.user._id,
        req.userRole
      );
      return sendSuccess(res, 'Task moved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      await TaskService.deleteTask(req.params.organizationId, req.params.taskId, req.user._id);
      return sendSuccess(res, 'Task archived/deleted');
    } catch (error) {
      next(error);
    }
  }

  static async duplicateTask(req, res, next) {
    try {
      const task = await TaskService.duplicateTask(req.params.organizationId, req.params.taskId, req.user._id);
      return sendSuccess(res, 'Task duplicated', { task }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdate(req, res, next) {
    try {
      const count = await TaskService.bulkUpdate(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, `${count} tasks updated successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async bulkDelete(req, res, next) {
    try {
      const count = await TaskService.bulkDelete(req.params.organizationId, req.body.taskIds, req.user._id);
      return sendSuccess(res, `${count} tasks deleted successfully`);
    } catch (error) {
      next(error);
    }
  }

  // Kanban
  static async getBoard(req, res, next) {
    try {
      const board = await KanbanService.getBoard(req.params.organizationId, req.params.projectId);
      return sendSuccess(res, 'Kanban board retrieved', { board });
    } catch (error) {
      next(error);
    }
  }

  static async reorderBoard(req, res, next) {
    try {
      await KanbanService.reorderBoard(req.params.organizationId, req.params.projectId, req.body);
      return sendSuccess(res, 'Board reordered successfully');
    } catch (error) {
      next(error);
    }
  }

  // Cycles
  static async createCycle(req, res, next) {
    try {
      const cycle = await CycleService.createCycle(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Cycle created', { cycle }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCycles(req, res, next) {
    try {
      const cycles = await CycleService.getCycles(req.params.organizationId, req.query);
      return sendSuccess(res, 'Cycles retrieved', { cycles });
    } catch (error) {
      next(error);
    }
  }

  static async getCycleById(req, res, next) {
    try {
      const cycle = await CycleService.getCycleById(req.params.organizationId, req.params.cycleId);
      return sendSuccess(res, 'Cycle retrieved', { cycle });
    } catch (error) {
      next(error);
    }
  }

  static async startCycle(req, res, next) {
    try {
      const cycle = await CycleService.startCycle(req.params.organizationId, req.params.cycleId, req.user._id);
      return sendSuccess(res, 'Cycle started', { cycle });
    } catch (error) {
      next(error);
    }
  }

  static async completeCycle(req, res, next) {
    try {
      const cycle = await CycleService.completeCycle(req.params.organizationId, req.params.cycleId, req.user._id);
      return sendSuccess(res, 'Cycle completed', { cycle });
    } catch (error) {
      next(error);
    }
  }

  static async getBurndown(req, res, next) {
    try {
      const burndown = await CycleService.getBurndown(req.params.organizationId, req.params.cycleId);
      return sendSuccess(res, 'Burndown retrieved', { burndown });
    } catch (error) {
      next(error);
    }
  }

  // Comments
  static async createComment(req, res, next) {
    try {
      const comment = await CommentService.createComment(
        req.params.organizationId,
        req.params.taskId,
        req.body,
        req.user._id
      );
      return sendSuccess(res, 'Comment posted', { comment }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getTaskComments(req, res, next) {
    try {
      const comments = await CommentService.getTaskComments(req.params.organizationId, req.params.taskId);
      return sendSuccess(res, 'Comments retrieved', { comments });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      await CommentService.deleteComment(req.params.organizationId, req.params.commentId, req.user._id);
      return sendSuccess(res, 'Comment deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectTaskController;
