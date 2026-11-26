import Cycle from '../models/Cycle.js';
import CycleSnapshot from '../models/CycleSnapshot.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { CYCLE_STATUSES, ACTIVITY_ACTIONS } from '../constants/index.js';
import { NotFoundError } from '../utils/errors.js';

export class CycleService {
  static async createCycle(orgId, data, creatorId) {
    const cycle = await Cycle.create({
      organizationId: orgId,
      projectId: data.projectId,
      name: data.name,
      description: data.description || '',
      goal: data.goal || '',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: CYCLE_STATUSES.PLANNED,
      createdBy: creatorId,
    });

    await Activity.create({
      organizationId: orgId,
      actorId: creatorId,
      projectId: data.projectId,
      action: ACTIVITY_ACTIONS.CYCLE_STARTED,
      entityType: 'cycle',
      entityId: cycle._id,
      newValues: { name: cycle.name },
    });

    return cycle;
  }

  static async getCycles(orgId, { projectId, status }) {
    const query = { organizationId: orgId };
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const cycles = await Cycle.find(query).sort({ startDate: -1 });

    // Compute progress for each cycle
    const cycleIds = cycles.map((c) => c._id);
    const tasksAggregation = await Task.aggregate([
      { $match: { cycleId: { $in: cycleIds } } },
      {
        $group: {
          _id: '$cycleId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ]);

    const taskMap = new Map();
    tasksAggregation.forEach((t) => taskMap.set(t._id.toString(), t));

    return cycles.map((c) => {
      const stats = taskMap.get(c._id.toString()) || { totalTasks: 0, completedTasks: 0 };
      const progress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
      return {
        ...c.toObject(),
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        progress,
      };
    });
  }

  static async getCycleById(orgId, cycleId) {
    const cycle = await Cycle.findOne({ _id: cycleId, organizationId: orgId });
    if (!cycle) throw new NotFoundError('Cycle not found');

    const tasks = await Task.find({ cycleId, organizationId: orgId, archivedAt: null })
      .populate('assigneeIds', 'firstName lastName avatar email');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...cycle.toObject(),
      totalTasks,
      completedTasks,
      progress,
      tasks,
    };
  }

  static async startCycle(orgId, cycleId, actorId) {
    const cycle = await Cycle.findOne({ _id: cycleId, organizationId: orgId });
    if (!cycle) throw new NotFoundError('Cycle not found');

    const totalTasks = await Task.countDocuments({ cycleId, organizationId: orgId });

    cycle.status = CYCLE_STATUSES.ACTIVE;
    cycle.startedAt = new Date();
    cycle.initialScope = totalTasks;
    await cycle.save();

    return cycle;
  }

  static async completeCycle(orgId, cycleId, actorId) {
    const cycle = await Cycle.findOne({ _id: cycleId, organizationId: orgId });
    if (!cycle) throw new NotFoundError('Cycle not found');

    cycle.status = CYCLE_STATUSES.COMPLETED;
    cycle.completedAt = new Date();
    await cycle.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      projectId: cycle.projectId,
      action: ACTIVITY_ACTIONS.CYCLE_COMPLETED,
      entityType: 'cycle',
      entityId: cycle._id,
    });

    return cycle;
  }

  static async getBurndown(orgId, cycleId) {
    const cycle = await Cycle.findOne({ _id: cycleId, organizationId: orgId });
    if (!cycle) throw new NotFoundError('Cycle not found');

    const snapshots = await CycleSnapshot.find({ cycleId, organizationId: orgId }).sort({ date: 1 });

    const totalTasks = await Task.countDocuments({ cycleId, organizationId: orgId });
    const completedTasks = await Task.countDocuments({ cycleId, organizationId: orgId, status: 'done' });
    const remainingTasks = totalTasks - completedTasks;

    return {
      cycleId,
      totalScope: cycle.initialScope || totalTasks,
      remainingTasks,
      completedTasks,
      history: snapshots,
    };
  }
}

export default CycleService;
