const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [50, 'Group name cannot be more than 50 characters'],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group admin is required'],
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    avatar: {
      type: String, // Cloudinary URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
groupSchema.index({ members: 1 });
groupSchema.index({ admin: 1 });

// Ensure admin is also a member
groupSchema.pre('save', function(next) {
  if (!this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);