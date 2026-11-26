import ChatService from '../services/chat.service.js';
import FileService from '../services/file.service.js';
import NotificationService from '../services/notification.service.js';
import AnalyticsService from '../services/analytics.service.js';
import SearchService from '../services/search.service.js';
import Activity from '../models/Activity.js';
import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { sanitizeUser } from '../utils/helpers.js';

export class CollaborationController {
  // Chat
  static async getConversations(req, res, next) {
    try {
      const conversations = await ChatService.getConversations(req.params.organizationId, req.user._id);
      return sendSuccess(res, 'Conversations retrieved', { conversations });
    } catch (error) {
      next(error);
    }
  }

  static async createConversation(req, res, next) {
    try {
      const conversation = await ChatService.createConversation(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Conversation created', { conversation }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    try {
      const messages = await ChatService.getMessages(req.params.organizationId, req.params.conversationId, req.user._id, req.query);
      return sendSuccess(res, 'Messages retrieved', { messages });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const message = await ChatService.sendMessage(req.params.organizationId, req.params.conversationId, req.body, req.user._id);
      return sendSuccess(res, 'Message sent', { message }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async markConversationRead(req, res, next) {
    try {
      await ChatService.markAsRead(req.params.organizationId, req.params.conversationId, req.user._id);
      return sendSuccess(res, 'Conversation marked as read');
    } catch (error) {
      next(error);
    }
  }

  // Files
  static async uploadFile(req, res, next) {
    try {
      const file = await FileService.uploadFile(req.params.organizationId, req.file, req.body, req.user._id);
      return sendSuccess(res, 'File uploaded successfully', { file }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFiles(req, res, next) {
    try {
      const result = await FileService.getFiles(req.params.organizationId, req.query);
      return sendPaginated(res, result.files, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }, 'Files retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      await FileService.deleteFile(req.params.organizationId, req.params.fileId, req.user._id);
      return sendSuccess(res, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  static async getNotifications(req, res, next) {
    try {
      const result = await NotificationService.getUserNotifications(req.params.organizationId, req.user._id, req.query);
      return sendPaginated(res, result.notifications, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.organizationId, req.params.notificationId, req.user._id);
      return sendSuccess(res, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllNotificationsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.params.organizationId, req.user._id);
      return sendSuccess(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  // Dashboard & Analytics
  static async getDashboardOverview(req, res, next) {
    try {
      const overview = await AnalyticsService.getOverview(req.params.organizationId);
      return sendSuccess(res, 'Dashboard overview retrieved', overview);
    } catch (error) {
      next(error);
    }
  }

  static async getReportsWorkload(req, res, next) {
    try {
      const workload = await AnalyticsService.getWorkload(req.params.organizationId);
      return sendSuccess(res, 'Workload report retrieved', { workload });
    } catch (error) {
      next(error);
    }
  }

  static async getWeeklyActivity(req, res, next) {
    try {
      const weekly = await AnalyticsService.getWeeklyActivity(req.params.organizationId);
      return sendSuccess(res, 'Weekly activity retrieved', { weekly });
    } catch (error) {
      next(error);
    }
  }

  // Global Search
  static async search(req, res, next) {
    try {
      const results = await SearchService.globalSearch(req.params.organizationId, req.query.q, req.user._id);
      return sendSuccess(res, 'Search results', results);
    } catch (error) {
      next(error);
    }
  }

  // Activity Audit Log
  static async getActivity(req, res, next) {
    try {
      const { page = 1, limit = 50, projectId } = req.query;
      const query = { organizationId: req.params.organizationId };
      if (projectId) query.projectId = projectId;

      const skip = (Number(page) - 1) * Number(limit);
      const [activities, total] = await Promise.all([
        Activity.find(query)
          .populate('actorId', 'firstName lastName avatar email')
          .populate('projectId', 'name key')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Activity.countDocuments(query),
      ]);

      return sendPaginated(res, activities, { page, limit, total }, 'Activity log retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Calendar
  static async getCalendarEvents(req, res, next) {
    try {
      const events = await CalendarEvent.find({ organizationId: req.params.organizationId })
        .populate('createdBy', 'firstName lastName avatar email')
        .sort({ startAt: 1 });
      return sendSuccess(res, 'Calendar events retrieved', { events });
    } catch (error) {
      next(error);
    }
  }

  static async createCalendarEvent(req, res, next) {
    try {
      const event = await CalendarEvent.create({
        ...req.body,
        organizationId: req.params.organizationId,
        createdBy: req.user._id,
      });
      return sendSuccess(res, 'Event created', { event }, 201);
    } catch (error) {
      next(error);
    }
  }
}

export class UserController {
  static async getProfile(req, res, next) {
    try {
      return sendSuccess(res, 'User profile', { user: sanitizeUser(req.user) });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const allowed = ['firstName', 'lastName', 'phone', 'jobTitle', 'department', 'bio', 'timezone', 'avatar'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) req.user[key] = req.body[key];
      }
      await req.user.save();
      return sendSuccess(res, 'Profile updated', { user: sanitizeUser(req.user) });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      if (req.body.theme) req.user.preferences.theme = req.body.theme;
      if (req.body.sidebarCollapsed !== undefined) req.user.preferences.sidebarCollapsed = req.body.sidebarCollapsed;
      if (req.body.displayDensity) req.user.preferences.displayDensity = req.body.displayDensity;
      if (req.body.notificationPreferences) {
        req.user.preferences.notificationPreferences = {
          ...req.user.preferences.notificationPreferences,
          ...req.body.notificationPreferences,
        };
      }
      await req.user.save();
      return sendSuccess(res, 'Preferences updated', { preferences: req.user.preferences });
    } catch (error) {
      next(error);
    }
  }
}
