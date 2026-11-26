import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    logo: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    industry: {
      type: String,
      default: '',
    },
    teamSize: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
    settings: {
      allowEmployeeReviewBypass: {
        type: Boolean,
        default: false,
      },
      requireTwoFactor: {
        type: Boolean,
        default: false,
      },
      defaultTaskPrefix: {
        type: String,
        default: 'TASK',
      },
      allowedEmailDomains: [String],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
