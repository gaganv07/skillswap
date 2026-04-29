const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 500
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      knowledge: {
        type: Number,
        min: 1,
        max: 5
      },
      reliability: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  { timestamps: true }
);

reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, reviewee: 1, swapRequest: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
