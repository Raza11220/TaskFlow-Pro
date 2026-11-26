import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { ACTIVITY_ACTIONS, PROJECT_STATUSES } from '../constants/index.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export class ProjectService {
  static async createProject(orgId, data, creatorId) {
    const existingKey = await Project.findOne({ organizationId: orgId, key: data.key.toUpperCase() });
    if (existingKey) {
      throw new ConflictError(`Project with key '${data.key}' already exists in this organization`);
    }

    const project = await Project.create({
      organizationId: orgId,
      name: data.name,
      key: data.key.toUpperCase(),
      description: data.description || '',
      icon: data.icon || 'Folder',
      color: data.color || '#0284c7',
      ownerId: creatorId,
      leadId: data.leadId || creatorId,
      memberIds: data.memberIds || [creatorId],
      priority: data.priority || 'medium',
      startDate: data.startDate || new Date(),
      endDate: data.endDate || null,
      createdBy: creatorId,
    });

    await Activity.create({
      organizationId: orgId,
      actorId: creatorId,
      projectId: project._id,
      action: ACTIVITY_ACTIONS.PROJECT_CREATED,
      entityType: 'project',
      entityId: project._id,
      newValues: { name: project.name, key: project.key },
    });

    return project;
  }

  static async getProjects(orgId, { search, status, priority, page = 1, limit = 50 }) {
    const query = { organizationId: orgId, archivedAt: null };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('leadId', 'firstName lastName avatar email')
        .populate('memberIds', 'firstName lastName avatar email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Project.countDocuments(query),
    ]);

    // Compute completion progress for each project
    const projectIds = projects.map((p) => p._id);
    const tasksAggregation = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ]);

    const taskMap = new Map();
    tasksAggregation.forEach((t) => taskMap.set(t._id.toString(), t));

    const enrichedProjects = projects.map((p) => {
      const stats = taskMap.get(p._id.toString()) || { total: 0, completed: 0 };
      const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        ...p.toObject(),
        taskStats: stats,
        progress,
      };
    });

    return {
      projects: enrichedProjects,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async getProjectById(orgId, projectId) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId })
      .populate('leadId', 'firstName lastName avatar email jobTitle')
      .populate('memberIds', 'firstName lastName avatar email jobTitle');

    if (!project) throw new NotFoundError('Project not found');

    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ projectId, organizationId: orgId }),
      Task.countDocuments({ projectId, organizationId: orgId, status: 'done' }),
    ]);

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project.toObject(),
      progress,
      totalTasks,
      completedTasks,
    };
  }

  static async updateProject(orgId, projectId, updates, actorId) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) throw new NotFoundError('Project not found');

    const allowed = ['name', 'description', 'icon', 'color', 'leadId', 'memberIds', 'status', 'priority', 'startDate', 'endDate'];
    const previousValues = {};
    const newValues = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        previousValues[key] = project[key];
        project[key] = updates[key];
        newValues[key] = updates[key];
      }
    }

    await project.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      projectId: project._id,
      action: ACTIVITY_ACTIONS.PROJECT_UPDATED,
      entityType: 'project',
      entityId: project._id,
      previousValues,
      newValues,
    });

    return project;
  }

  static async archiveProject(orgId, projectId, actorId) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) throw new NotFoundError('Project not found');

    project.archivedAt = new Date();
    await project.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      projectId: project._id,
      action: ACTIVITY_ACTIONS.PROJECT_ARCHIVED,
      entityType: 'project',
      entityId: project._id,
    });

    return project;
  }

  static async restoreProject(orgId, projectId, actorId) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) throw new NotFoundError('Project not found');

    project.archivedAt = null;
    await project.save();
    return project;
  }
}

export default ProjectService;
