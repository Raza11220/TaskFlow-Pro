import cron from 'node-cron';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Cycle from '../models/Cycle.js';
import CycleSnapshot from '../models/CycleSnapshot.js';
import Invitation from '../models/Invitation.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const generateCycleSnapshots = async () => {
  logger.info('[CRON] Running daily cycle snapshot generator...');
  try {
    const activeCycles = await Cycle.find({ status: 'active' });
    const today = new Date().toISOString().split('T')[0];

    for (const cycle of activeCycles) {
      const totalTasks = await Task.countDocuments({
        cycleId: cycle._id,
        organizationId: cycle.organizationId,
      });
      const completedTasks = await Task.countDocuments({
        cycleId: cycle._id,
        organizationId: cycle.organizationId,
        status: 'done',
      });
      const remainingTasks = totalTasks - completedTasks;

      await CycleSnapshot.findOneAndUpdate(
        { cycleId: cycle._id, date: today },
        {
          organizationId: cycle.organizationId,
          cycleId: cycle._id,
          date: today,
          totalScope: cycle.initialScope || totalTasks,
          remainingTasks,
          completedTasks,
        },
        { upsert: true }
      );
    }
    logger.info(
      `[CRON] Cycle snapshots completed for ${activeCycles.length} active cycles.`
    );
  } catch (err) {
    logger.error(`[CRON] Error generating cycle snapshots: ${err.message}`);
    throw err;
  }
};

export const sendOverdueReminders = async () => {
  logger.info('[CRON] Checking overdue task reminders...');
  try {
    const overdueTasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
      archivedAt: null,
    });

    for (const task of overdueTasks) {
      for (const assigneeId of task.assigneeIds || []) {
        // Check if notification already sent today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Notification.findOne({
          recipientId: assigneeId,
          entityId: task._id,
          type: NOTIFICATION_TYPES.TASK_OVERDUE,
          createdAt: { $gte: today },
        });

        if (!existing) {
          await Notification.create({
            organizationId: task.organizationId,
            recipientId: assigneeId,
            type: NOTIFICATION_TYPES.TASK_OVERDUE,
            title: 'Task Overdue',
            message: `Task ${task.identifier} ("${task.title}") is past its deadline.`,
            entityType: 'task',
            entityId: task._id,
          });
        }
      }
    }
  } catch (err) {
    logger.error(`[CRON] Error sending overdue reminders: ${err.message}`);
    throw err;
  }
};

export const expireInvitations = async () => {
  try {
    await Invitation.updateMany(
      { expiresAt: { $lt: new Date() }, status: 'pending' },
      { $set: { status: 'expired' } }
    );
  } catch (err) {
    logger.error(`[CRON] Error expiring invitations: ${err.message}`);
    throw err;
  }
};

export const runDailyJobs = async () => {
  await generateCycleSnapshots();
  await sendOverdueReminders();
  await expireInvitations();
};

export const initBackgroundJobs = () => {
  const schedule = (expression, job) =>
    cron.schedule(
      expression,
      () => {
        void job().catch(() => {}); // Each job logs its failure.
      },
      { timezone: env.APP_TIMEZONE }
    );
  schedule('0 0 * * *', generateCycleSnapshots);
  schedule('0 9 * * *', sendOverdueReminders);
  schedule('0 1 * * *', expireInvitations);
  logger.info('Background cron jobs initialized successfully.');
};

export default initBackgroundJobs;
