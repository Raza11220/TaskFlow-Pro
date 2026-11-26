import { verifyAccessToken } from '../utils/security.js';
import User from '../models/User.js';
import OrganizationMember from '../models/OrganizationMember.js';
import ChatService from '../services/chat.service.js';
import logger from '../config/logger.js';

export const configureSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required for WebSocket connection'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (!user || user.accountStatus !== 'active') {
        return next(new Error('User inactive or invalid'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.warn(`WebSocket authentication failed: ${error.message}`);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`WebSocket user connected: ${socket.user.fullName} (${userId})`);

    // Join personal user room
    socket.join(`user:${userId}`);

    // Join organization rooms
    socket.on('org:join', async ({ organizationId }) => {
      try {
        const member = await OrganizationMember.findOne({
          organizationId,
          userId: socket.user._id,
          status: 'active',
        });
        if (member) {
          socket.join(`org:${organizationId}`);
          logger.info(`User ${userId} joined room org:${organizationId}`);
        }
      } catch (err) {
        logger.error(`Error joining org room: ${err.message}`);
      }
    });

    // Join conversation room
    socket.on('conversation:join', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId, organizationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:started', {
        conversationId,
        user: {
          id: socket.user._id,
          name: socket.user.fullName,
        },
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stopped', {
        conversationId,
        userId: socket.user._id,
      });
    });

    // Real-time message sending via socket
    socket.on('message:send', async ({ organizationId, conversationId, content, messageType, voiceData, attachments }, callback) => {
      try {
        const message = await ChatService.sendMessage(
          organizationId,
          conversationId,
          { content, messageType, voiceData, attachments },
          socket.user._id
        );

        io.to(`conversation:${conversationId}`).emit('message:new', message);

        if (typeof callback === 'function') {
          callback({ success: true, message });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket user disconnected: ${userId}`);
    });
  });
};

export default configureSockets;
