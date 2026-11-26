import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Counter from '../models/Counter.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  ACTIVITY_ACTIONS,
  NOTIFICATION_TYPES,
  TASK_STATUSES,
  VALID_STATUS_TRANSITIONS,
} from '../constants/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class TaskService {
  static async getNextTaskNumber(orgId, projectId) {
    const counter = await Counter.findOneAndUpdate(
      { organizationId: orgId, projectId },
      { $inc: { sequenceValue: 1 } },
      { upsert: true, new: true }
    );
    return counter.sequenceValue;
  }

  static async createTask(orgId, data, creatorId) {
    const project = await Project.findOne({ _id: data.projectId, organizationId: orgId });
    if (!project) throw new NotFoundError('Project not found in this organization');

    const taskNumber = await this.getNextTaskNumber(orgId, project._id);
    const identifier = `${project.key}-${String(taskNumber).padStart(3, '0')}`;

    const task = await Task.create({
      organizationId: orgId,
      projectId: project._id,
      cycleId: data.cycleId || null,
      parentTaskId: data.parentTaskId || null,
      taskNumber,
      identifier,
      title: data.title,
      description: data.description || '',
      status: data.status || TASK_STATUSES.TODO,
      priority: data.priority || 'medium',
      assigneeIds: data.assigneeIds || [],
      createdBy: creatorId,
      labels: data.labels || [],
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      estimatedMinutes: data.estimatedMinutes || 0,
    });

    await Activity.create({
      organizationId: orgId,
      actorId: creatorId,
      projectId: project._id,
      action: ACTIVITY_ACTIONS.TASK_CREATED,
      entityType: 'task',
      entityId: task._id,
      newValues: { title: task.title, identifier: task.identifier, status: task.status },
    });

    // Notify assignees
    if (task.assigneeIds?.length > 0) {
      const creator = await User.findById(creatorId);
      const notifications = task.assigneeIds
        .filter((id) => id.toString() !== creatorId.toString())
        .map((recipientId) => ({
          organizationId: orgId,
          recipientId,
          actorId: creatorId,
          type: NOTIFICATION_TYPES.TASK_ASSIGNED,
          title: 'Assigned to new task',
          message: `${creator?.firstName || 'A team member'} assigned you to ${task.identifier}: "${task.title}"`,
          entityType: 'task',
          entityId: task._id,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return task;
  }

  static async getTasks(orgId, {
    projectId,
    status,
    priority,
    assigneeId,
    cycleId,
    search,
    overdue,
    page = 1,
    limit = 50,
  }) {
    const query = { organizationId: orgId, archivedAt: null };
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId) query.assigneeIds = assigneeId;
    if (cycleId) query.cycleId = cycleId;
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: TASK_STATUSES.DONE };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { identifier: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('projectId', 'name key color')
        .populate('assigneeIds', 'firstName lastName avatar email jobTitle')
        .populate('createdBy', 'firstName lastName avatar email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ position: 1, createdAt: -1 }),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async getTaskById(orgId, taskId) {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId })
      .populate('projectId', 'name key color leadId')
      .populate('assigneeIds', 'firstName lastName avatar email jobTitle department')
      .populate('createdBy', 'firstName lastName avatar email');

    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  static async updateTask(orgId, taskId, updates, actorId) {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) throw new NotFoundError('Task not found');

    const allowed = [
      'title', 'description', 'priority', 'assigneeIds', 'labels',
      'cycleId', 'parentTaskId', 'startDate', 'dueDate', 'estimatedMinutes',
    ];

    const previousValues = {};
    const newValues = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        previousValues[key] = task[key];
        task[key] = updates[key];
        newValues[key] = updates[key];
      }
    }

    task.version += 1;
    await task.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      projectId: task.projectId,
      action: ACTIVITY_ACTIONS.TASK_UPDATED,
      entityType: 'task',
      entityId: task._id,
      previousValues,
      newValues,
    });

    return task;
  }

  static async updateTaskStatus(orgId, taskId, newStatus, actorId, userRole = 'employee', bypassReview = false) {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) throw new NotFoundError('Task not found');

    if (task.status === newStatus) return task;

    // Validate permitted transitions
    const validNextStatuses = VALID_STATUS_TRANSITIONS[task.status] || [];
    if (!validNextStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid task status transition from '${task.status}' to '${newStatus}'`);
    }

    // Role verification for completing review
    if (newStatus === TASK_STATUSES.DONE && userRole === 'employee' && !bypassReview) {
      if (task.status !== TASK_STATUSES.REVIEW) {
        throw new BadRequestError('Employees must submit tasks for Review before marking Done');
      }
    }

    const oldStatus = task.status;
    task.status = newStatus;
    task.version += 1;

    if (newStatus === TASK_STATUSES.DONE) {
      task.completedAt = new Date();
      task.completedBy = actorId;
    } else if (oldStatus === TASK_STATUSES.DONE) {
      task.completedAt = null;
      task.completedBy = null;
    }

    await task.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      projectId: task.projectId,
      action: newStatus === TASK_STATUSES.DONE ? ACTIVITY_ACTIONS.TASK_COMPLETED : ACTIVITY_ACTIONS.TASK_MOVED,
      entityType: 'task',
      entityId: task._id,
      previousValues: { status: oldStatus },
      newValues: { status: newStatus },
    });

    // Notify task creator and assignees
    const recipients = new Set([...(task.assigneeIds || []).map((id) => id.toString()), task.createdBy.toString()]);
    recipients.delete(actorId.toString());

    if (recipients.size > 0) {
      const actor = await User.findById(actorId);
      const notifications = Array.from(recipients).map((recipientId) => ({
        organizationId: orgId,
        recipientId,
        actorId,
        type: NOTIFICATION_TYPES.TASK_STATUS_CHANGED,
        title: 'Task status updated',
        message: `${actor?.firstName || 'A team member'} moved ${task.identifier} to ${newStatus}`,
        entityType: 'task',
        entityId: task._id,
      }));
      await Notification.insertMany(notifications);
    }

    return task;
  }

  static async moveTask(orgId, taskId, { status, position }, actorId, userRole = 'employee') {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) throw new NotFoundError('Task not found');

    if (status && status !== task.status) {
      await this.updateTaskStatus(orgId, taskId, status, actorId, userRole);
    }

    if (position !== undefined) {
      task.position = position;
      await task.save();
    }

    return task;
  }

  static async deleteTask(orgId, taskId, actorId) {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) throw new NotFoundError('Task not found');

    task.archivedAt = new Date();
    await task.save();

    return true;
  }

  static async duplicateTask(orgId, taskId, actorId) {
    const original = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!original) throw new NotFoundError('Task not found');

    return this.createTask(
      orgId,
      {
        projectId: original.projectId.toString(),
        title: `${original.title} (Copy)`,
        description: original.description,
        priority: original.priority,
        status: TASK_STATUSES.TODO,
        assigneeIds: original.assigneeIds.map((id) => id.toString()),
        labels: original.labels,
        cycleId: original.cycleId?.toString(),
        dueDate: original.dueDate,
        estimatedMinutes: original.estimatedMinutes,
      },
      actorId
    );
  }

  static async bulkUpdate(orgId, { taskIds, updates }, actorId) {
    const tasks = await Task.find({ _id: { $in: taskIds }, organizationId: orgId });
    const allowed = ['status', 'priority', 'cycleId'];

    const updatePayload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) updatePayload[key] = updates[key];
    }

    await Task.updateMany({ _id: { $in: taskIds }, organizationId: orgId }, { $set: updatePayload });
    return tasks.length;
  }

  static async bulkDelete(orgId, taskIds, actorId) {
    const result = await Task.updateMany(
      { _id: { $in: taskIds }, organizationId: orgId },
      { $set: { archivedAt: new Date() } }
    );
    return result.modifiedCount;
  }
}

export default TaskService;
