import mongoose from 'mongoose';

const conversationReadStateSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationReadStateSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

export const ConversationReadState = mongoose.model('ConversationReadState', conversationReadStateSchema);
export default ConversationReadState;
