import Project from '../models/Project.js';
import Task from '../models/Task.js';
import OrganizationMember from '../models/OrganizationMember.js';
import Activity from '../models/Activity.js';
import { TASK_STATUSES } from '../constants/index.js';

export class AnalyticsService {
  static async getOverview(orgId) {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalMembers,
    ] = await Promise.all([
      Project.countDocuments({ organizationId: orgId, archivedAt: null }),
      Project.countDocuments({ organizationId: orgId, status: 'active', archivedAt: null }),
      Task.countDocuments({ organizationId: orgId, archivedAt: null }),
      Task.countDocuments({ organizationId: orgId, status: TASK_STATUSES.DONE, archivedAt: null }),
      Task.countDocuments({
        organizationId: orgId,
        dueDate: { $lt: new Date() },
        status: { $ne: TASK_STATUSES.DONE },
        archivedAt: null,
      }),
      OrganizationMember.countDocuments({ organizationId: orgId, status: 'active' }),
    ]);

    const activeTasks = totalTasks - completedTasks;
    const projectCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task distribution by status
    const statusDistribution = await Task.aggregate([
      { $match: { organizationId: orgId, archivedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Task distribution by priority
    const priorityDistribution = await Task.aggregate([
      { $match: { organizationId: orgId, archivedAt: null } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    return {
      metrics: {
        totalProjects,
        activeProjects,
        totalTasks,
        activeTasks,
        completedTasks,
        overdueTasks,
        totalMembers,
        projectCompletionRate,
      },
      tasksByStatus: statusDistribution.map((s) => ({ status: s._id, count: s.count })),
      tasksByPriority: priorityDistribution.map((p) => ({ priority: p._id, count: p.count })),
    };
  }

  static async getWorkload(orgId) {
    const members = await OrganizationMember.find({ organizationId: orgId, status: 'active' })
      .populate('userId', 'firstName lastName avatar email jobTitle');

    const workload = await Promise.all(
      members.map(async (m) => {
        const u = m.userId;
        if (!u) return null;

        const assignedTasks = await Task.countDocuments({
          organizationId: orgId,
          assigneeIds: u._id,
          archivedAt: null,
        });

        const completedTasks = await Task.countDocuments({
          organizationId: orgId,
          assigneeIds: u._id,
          status: TASK_STATUSES.DONE,
          archivedAt: null,
        });

        return {
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          avatar: u.avatar,
          jobTitle: u.jobTitle,
          assignedTasks,
          completedTasks,
          activeTasks: assignedTasks - completedTasks,
        };
      })
    );

    return workload.filter(Boolean);
  }

  static async getWeeklyActivity(orgId) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completedTasks = await Task.aggregate([
      {
        $match: {
          organizationId: orgId,
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return completedTasks.map((c) => ({
      date: c._id,
      completedCount: c.count,
    }));
  }
}

export default AnalyticsService;
