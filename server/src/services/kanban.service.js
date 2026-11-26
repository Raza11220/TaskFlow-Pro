import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { TASK_STATUSES } from '../constants/index.js';
import { NotFoundError } from '../utils/errors.js';

export class KanbanService {
  static async getBoard(orgId, projectId) {
    const project = await Project.findOne({ _id: projectId, organizationId: orgId });
    if (!project) throw new NotFoundError('Project not found');

    const tasks = await Task.find({
      organizationId: orgId,
      projectId,
      archivedAt: null,
    })
      .populate('assigneeIds', 'firstName lastName avatar email jobTitle')
      .sort({ position: 1, createdAt: -1 });

    const columns = {
      [TASK_STATUSES.BACKLOG]: [],
      [TASK_STATUSES.TODO]: [],
      [TASK_STATUSES.IN_PROGRESS]: [],
      [TASK_STATUSES.REVIEW]: [],
      [TASK_STATUSES.DONE]: [],
    };

    tasks.forEach((task) => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      }
    });

    return {
      project: {
        id: project._id,
        name: project.name,
        key: project.key,
      },
      columns,
    };
  }

  static async reorderBoard(orgId, projectId, { column, taskOrders }) {
    // taskOrders: [{ taskId, position }]
    const bulkOps = taskOrders.map(({ taskId, position }) => ({
      updateOne: {
        filter: { _id: taskId, organizationId: orgId, projectId },
        update: { $set: { position } },
      },
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    return true;
  }
}

export default KanbanService;
