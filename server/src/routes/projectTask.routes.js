import { Router } from 'express';
import ProjectTaskController from '../controllers/projectTask.controller.js';
import { authenticate, requireOrganizationMembership, requirePermission } from '../middleware/auth.js';
import validateRequest from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskStatusSchema,
  moveTaskSchema,
  createCycleSchema,
  createCommentSchema,
} from '../validators/projectTask.validator.js';
import { PERMISSIONS } from '../constants/index.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireOrganizationMembership);

// Projects
router.post(
  '/projects',
  requirePermission(PERMISSIONS.PROJECT_CREATE),
  validateRequest(createProjectSchema),
  ProjectTaskController.createProject
);
router.get('/projects', ProjectTaskController.getProjects);
router.get('/projects/:projectId', ProjectTaskController.getProjectById);
router.patch(
  '/projects/:projectId',
  requirePermission(PERMISSIONS.PROJECT_EDIT),
  validateRequest(updateProjectSchema),
  ProjectTaskController.updateProject
);
router.post('/projects/:projectId/archive', requirePermission(PERMISSIONS.PROJECT_ARCHIVE), ProjectTaskController.archiveProject);
router.post('/projects/:projectId/restore', requirePermission(PERMISSIONS.PROJECT_ARCHIVE), ProjectTaskController.restoreProject);

// Tasks
router.post(
  '/tasks',
  requirePermission(PERMISSIONS.TASK_CREATE),
  validateRequest(createTaskSchema),
  ProjectTaskController.createTask
);
router.get('/tasks', ProjectTaskController.getTasks);
router.get('/tasks/:taskId', ProjectTaskController.getTaskById);
router.patch(
  '/tasks/:taskId',
  requirePermission(PERMISSIONS.TASK_EDIT),
  ProjectTaskController.updateTask
);
router.patch(
  '/tasks/:taskId/status',
  requirePermission(PERMISSIONS.TASK_UPDATE_STATUS),
  validateRequest(updateTaskStatusSchema),
  ProjectTaskController.updateTaskStatus
);
router.patch(
  '/tasks/:taskId/move',
  requirePermission(PERMISSIONS.TASK_UPDATE_STATUS),
  validateRequest(moveTaskSchema),
  ProjectTaskController.moveTask
);
router.delete(
  '/tasks/:taskId',
  requirePermission(PERMISSIONS.TASK_DELETE),
  ProjectTaskController.deleteTask
);
router.post('/tasks/:taskId/duplicate', requirePermission(PERMISSIONS.TASK_CREATE), ProjectTaskController.duplicateTask);
router.post('/tasks/bulk-update', requirePermission(PERMISSIONS.TASK_EDIT), ProjectTaskController.bulkUpdate);
router.post('/tasks/bulk-delete', requirePermission(PERMISSIONS.TASK_DELETE), ProjectTaskController.bulkDelete);

// Kanban
router.get('/projects/:projectId/board', ProjectTaskController.getBoard);
router.patch('/projects/:projectId/board/reorder', requirePermission(PERMISSIONS.TASK_UPDATE_STATUS), ProjectTaskController.reorderBoard);

// Cycles
router.post('/cycles', requirePermission(PERMISSIONS.CYCLE_MANAGE), validateRequest(createCycleSchema), ProjectTaskController.createCycle);
router.get('/cycles', ProjectTaskController.getCycles);
router.get('/cycles/:cycleId', ProjectTaskController.getCycleById);
router.post('/cycles/:cycleId/start', requirePermission(PERMISSIONS.CYCLE_MANAGE), ProjectTaskController.startCycle);
router.post('/cycles/:cycleId/complete', requirePermission(PERMISSIONS.CYCLE_MANAGE), ProjectTaskController.completeCycle);
router.get('/cycles/:cycleId/burndown', ProjectTaskController.getBurndown);

// Comments
router.post('/tasks/:taskId/comments', validateRequest(createCommentSchema), ProjectTaskController.createComment);
router.get('/tasks/:taskId/comments', ProjectTaskController.getTaskComments);
router.delete('/comments/:commentId', ProjectTaskController.deleteComment);

export default router;
