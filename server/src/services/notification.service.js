import Notification from '../models/Notification.js';
import { NotFoundError } from '../utils/errors.js';

export class NotificationService {
  static async getUserNotifications(orgId, userId, { page = 1, limit = 50 }) {
    const query = { organizationId: orgId, recipientId: userId, archivedAt: null };
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('actorId', 'firstName lastName avatar email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, readAt: null }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async markAsRead(orgId, notificationId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, organizationId: orgId, recipientId: userId },
      { readAt: new Date() },
      { new: true }
    );
    if (!notif) throw new NotFoundError('Notification not found');
    return notif;
  }

  static async markAllAsRead(orgId, userId) {
    await Notification.updateMany(
      { organizationId: orgId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return true;
  }

  static async deleteNotification(orgId, notificationId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, organizationId: orgId, recipientId: userId },
      { archivedAt: new Date() }
    );
    if (!notif) throw new NotFoundError('Notification not found');
    return true;
  }
}

export default NotificationService;
