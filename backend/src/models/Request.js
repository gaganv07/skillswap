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
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userPair to ensure uniqueness
requestSchema.index({ userPair: 1 }, { unique: true });

// Set derived fields before validation so create() does not fail required checks.
requestSchema.pre('validate', function (next) {
  // Prevent self-requests
  if (this.sender && this.receiver && this.sender.equals(this.receiver)) {
    const error = new Error('Cannot send request to yourself');
    return next(error);
  }

  // Create sorted pair for uniqueness
  if (this.sender && this.receiver) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.userPair = ids.join('_');
  }

  next();
});

module.exports = mongoose.model('Request', requestSchema);
