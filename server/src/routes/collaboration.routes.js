import { Router } from 'express';
import multer from 'multer';
import { CollaborationController, UserController } from '../controllers/collaboration.controller.js';
import { authenticate, requireOrganizationMembership } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router({ mergeParams: true });

router.use(authenticate, requireOrganizationMembership);

// Chat
router.get('/conversations', CollaborationController.getConversations);
router.post('/conversations', CollaborationController.createConversation);
router.get('/conversations/:conversationId/messages', CollaborationController.getMessages);
router.post('/conversations/:conversationId/messages', CollaborationController.sendMessage);
router.post('/conversations/:conversationId/read', CollaborationController.markConversationRead);

// Files
router.get('/files', CollaborationController.getFiles);
router.post('/files/upload', upload.single('file'), CollaborationController.uploadFile);
router.delete('/files/:fileId', CollaborationController.deleteFile);

// Notifications
router.get('/notifications', CollaborationController.getNotifications);
router.patch('/notifications/read-all', CollaborationController.markAllNotificationsRead);
router.patch('/notifications/:notificationId/read', CollaborationController.markNotificationRead);

// Dashboard & Analytics
router.get('/dashboard/overview', CollaborationController.getDashboardOverview);
router.get('/reports/workload', CollaborationController.getReportsWorkload);
router.get('/reports/weekly-activity', CollaborationController.getWeeklyActivity);

// Global Search
router.get('/search', CollaborationController.search);

// Activity Logs
router.get('/activity', CollaborationController.getActivity);

// Calendar
router.get('/calendar/events', CollaborationController.getCalendarEvents);
router.post('/calendar/events', CollaborationController.createCalendarEvent);

export default router;
