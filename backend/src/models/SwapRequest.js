const mongoose = require('mongoose');

const swapSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  { _id: false }
);

const swapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requesterSkill: {
      type: swapSkillSchema,
      required: true
    },
    responderSkill: {
      type: swapSkillSchema,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    message: {
      type: String,
      maxlength: 500
    },
    proposedDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    reviewedByRequester: {
      type: Boolean,
      default: false
    },
    reviewedByResponder: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

swapRequestSchema.index({ requester: 1, createdAt: -1 });
swapRequestSchema.index({ responder: 1, createdAt: -1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
