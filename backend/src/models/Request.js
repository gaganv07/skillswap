const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Store sorted user pair to prevent duplicates in both directions
    userPair: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userPair to ensure uniqueness
requestSchema.index({ userPair: 1 }, { unique: true });

// Prevent self-requests and set userPair
requestSchema.pre('save', function (next) {
  // Prevent self-requests
  if (this.sender.equals(this.receiver)) {
    const error = new Error('Cannot send request to yourself');
    return next(error);
  }

  // Create sorted pair for uniqueness
  const ids = [this.sender.toString(), this.receiver.toString()].sort();
  this.userPair = ids.join('_');

  next();
});

module.exports = mongoose.model('Request', requestSchema);