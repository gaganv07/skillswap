const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    lastMessage: {
      content: {
        type: String,
        maxlength: [2000, 'Message content cannot be more than 2000 characters'],
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['text', 'image', 'file', 'call'],
        default: 'text',
      },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ 'unreadCounts.$*': 1 }); // Index on map values

// Pre-save middleware to ensure participants are sorted for consistency
conversationSchema.pre('save', function(next) {
  if (this.participants && this.participants.length > 0) {
    this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
  next();
});

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCounts.get(userId.toString()) || 0;
  this.unreadCounts.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);