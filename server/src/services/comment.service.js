import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } from '../constants/index.js';
import { NotFoundError } from '../utils/errors.js';

export class CommentService {
  static async createComment(orgId, taskId, data, authorId) {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) throw new NotFoundError('Task not found');

    const comment = await Comment.create({
      organizationId: orgId,
      taskId,
      authorId,
      content: data.content,
      mentionedUserIds: data.mentionedUserIds || [],
      parentCommentId: data.parentCommentId || null,
    });

    await Activity.create({
      organizationId: orgId,
      actorId: authorId,
      projectId: task.projectId,
      action: ACTIVITY_ACTIONS.COMMENT_ADDED,
      entityType: 'comment',
      entityId: comment._id,
    });

    // Notify mentioned users
    if (data.mentionedUserIds?.length > 0) {
      const author = await User.findById(authorId);
      const notifications = data.mentionedUserIds
        .filter((id) => id.toString() !== authorId.toString())
        .map((recipientId) => ({
          organizationId: orgId,
          recipientId,
          actorId: authorId,
          type: NOTIFICATION_TYPES.TASK_MENTION,
          title: 'Mentioned in a comment',
          message: `${author?.firstName || 'A team member'} mentioned you on task ${task.identifier}`,
          entityType: 'task',
          entityId: task._id,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return comment.populate('authorId', 'firstName lastName avatar email jobTitle');
  }

  static async getTaskComments(orgId, taskId) {
    return Comment.find({ organizationId: orgId, taskId, deletedAt: null })
      .populate('authorId', 'firstName lastName avatar email jobTitle')
      .sort({ createdAt: 1 });
  }

  static async deleteComment(orgId, commentId, actorId) {
    const comment = await Comment.findOne({ _id: commentId, organizationId: orgId });
    if (!comment) throw new NotFoundError('Comment not found');

    comment.deletedAt = new Date();
    await comment.save();
    return true;
  }
}

export default CommentService;
