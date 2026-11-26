import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sequenceValue: {
    type: Number,
    default: 0,
  },
});

counterSchema.index({ organizationId: 1, projectId: 1 }, { unique: true });

export const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
