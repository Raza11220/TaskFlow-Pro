import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ConversationReadState from '../models/ConversationReadState.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { CONVERSATION_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class ChatService {
  static async getConversations(orgId, userId) {
    const conversations = await Conversation.find({
      organizationId: orgId,
      memberIds: userId,
      archivedAt: null,
    })
      .populate('memberIds', 'firstName lastName avatar email jobTitle')
      .sort({ lastMessageAt: -1 });

    const convIds = conversations.map((c) => c._id);
    const readStates = await ConversationReadState.find({
      conversationId: { $in: convIds },
      userId,
    });
    const readStateMap = new Map();
    readStates.forEach((rs) => readStateMap.set(rs.conversationId.toString(), rs));

    // Get unread counts
    const results = await Promise.all(
      conversations.map(async (conv) => {
        const rs = readStateMap.get(conv._id.toString());
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          createdAt: { $gt: rs?.lastReadAt || new Date(0) },
          senderId: { $ne: userId },
        });

        const lastMsg = await Message.findOne({ conversationId: conv._id }).sort({ createdAt: -1 });

        return {
          ...conv.toObject(),
          unreadCount,
          lastMessage: lastMsg?.content || (lastMsg?.messageType === 'voice' ? '🎤 Voice message' : ''),
          lastMessageTime: lastMsg?.createdAt || conv.lastMessageAt,
        };
      })
    );

    return results;
  }

  static async createConversation(orgId, data, creatorId) {
    let memberIds = data.memberIds || [];
    if (!memberIds.includes(creatorId.toString())) {
      memberIds.push(creatorId.toString());
    }

    if (data.type === CONVERSATION_TYPES.DIRECT && memberIds.length === 2) {
      const existing = await Conversation.findOne({
        organizationId: orgId,
        type: CONVERSATION_TYPES.DIRECT,
        memberIds: { $all: memberIds, $size: 2 },
      }).populate('memberIds', 'firstName lastName avatar email jobTitle');

      if (existing) return existing;
    }

    const conv = await Conversation.create({
      organizationId: orgId,
      type: data.type || CONVERSATION_TYPES.DIRECT,
      name: data.name || '',
      description: data.description || '',
      memberIds,
      createdBy: creatorId,
    });

    return conv.populate('memberIds', 'firstName lastName avatar email jobTitle');
  }

  static async getMessages(orgId, convId, userId, { limit = 50, before }) {
    const conv = await Conversation.findOne({ _id: convId, organizationId: orgId, memberIds: userId });
    if (!conv) throw new ForbiddenError('Conversation not found or access denied');

    const query = { conversationId: convId, deletedAt: null };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'firstName lastName avatar email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return messages.reverse();
  }

  static async sendMessage(orgId, convId, data, senderId) {
    const conv = await Conversation.findOne({ _id: convId, organizationId: orgId, memberIds: senderId });
    if (!conv) throw new ForbiddenError('Conversation not found or access denied');

    const msg = await Message.create({
      organizationId: orgId,
      conversationId: convId,
      senderId,
      content: data.content || '',
      messageType: data.messageType || 'text',
      attachments: data.attachments || [],
      voiceData: data.voiceData || null,
      replyToMessageId: data.replyToMessageId || null,
    });

    conv.lastMessageAt = new Date();
    await conv.save();

    // Update sender's read state
    await ConversationReadState.findOneAndUpdate(
      { conversationId: convId, userId: senderId },
      { lastReadMessageId: msg._id, lastReadAt: new Date() },
      { upsert: true }
    );

    return msg.populate('senderId', 'firstName lastName avatar email');
  }

  static async markAsRead(orgId, convId, userId) {
    const lastMsg = await Message.findOne({ conversationId: convId }).sort({ createdAt: -1 });
    await ConversationReadState.findOneAndUpdate(
      { conversationId: convId, userId },
      { lastReadMessageId: lastMsg?._id, lastReadAt: new Date() },
      { upsert: true }
    );
    return true;
  }
}

export default ChatService;
