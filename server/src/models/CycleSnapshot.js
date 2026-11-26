import mongoose from 'mongoose';

const cycleSnapshotSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cycle',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalScope: {
      type: Number,
      default: 0,
    },
    remainingTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    addedTasks: {
      type: Number,
      default: 0,
    },
    removedTasks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cycleSnapshotSchema.index({ cycleId: 1, date: 1 }, { unique: true });

export const CycleSnapshot = mongoose.model('CycleSnapshot', cycleSnapshotSchema);
export default CycleSnapshot;
