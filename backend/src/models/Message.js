const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: function() {
        return this.type === 'text';
      },
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'call'],
      default: 'text',
    },
    fileUrl: {
      type: String, // Cloudinary URL for images/files
    },
    fileName: {
      type: String, // Original filename
    },
    fileSize: {
      type: Number, // File size in bytes
    },
    encryptedContent: {
      type: String, // For E2EE - encrypted message content
    },
    encryptionKey: {
      type: String, // For group encryption - shared key (encrypted)
    },
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isGroupMessage: {
      type: Boolean,
      default: false,
    },
    // For direct messages (legacy support)
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 }); // Legacy support

module.exports = mongoose.model('Message', messageSchema);
