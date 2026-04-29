const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Skill cannot be more than 50 characters']
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    profileImage: {
      type: String,
      default: null
    },
    profilePic: {
      type: String,
      default: null
    },
    skillsToTeach: {
      type: [String],
      default: []
    },
    skillsToLearn: {
      type: [String],
      default: []
    },
    // Simple string arrays for matching
    skillsOfferedSimple: {
      type: [String],
      default: []
    },
    skillsWantedSimple: {
      type: [String],
      default: []
    },
    availability: {
      type: String,
      enum: ['flexible', 'weekends', 'evenings', 'limited'],
      default: 'flexible'
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    totalSwaps: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // End-to-End Encryption keys
    publicKey: {
      type: String,
      select: false // Don't expose in queries by default
    },
    privateKey: {
      type: String,
      select: false // Encrypted and stored securely
    },
    // Push notification tokens
    pushTokens: [{
      token: {
        type: String,
        required: true,
      },
      platform: {
        type: String,
        enum: ['web', 'ios', 'android'],
        default: 'web',
      },
      registeredAt: {
        type: Date,
        default: Date.now,
      },
    }],
    refreshTokens: [
      {
        tokenHash: {
          type: String,
          required: true,
          select: false
        },
        expiresAt: {
          type: Date,
          required: true,
          select: false
        }
      }
    ],
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'skillsOffered.skill': 1 });
userSchema.index({ 'skillsWanted.skill': 1 });
userSchema.index({ 'rating.average': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public user data (without password)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;

  // Provide a consistent profile image field for frontend usage
  obj.profileImage = obj.profileImage || obj.profilePic || null;
  obj.profilePic = obj.profileImage;

  // Support both old and new skill field names
  obj.teachSkills = obj.teachSkills?.length ? obj.teachSkills : obj.skillsToTeach || [];
  obj.learnSkills = obj.learnSkills?.length ? obj.learnSkills : obj.skillsToLearn || [];
  obj.skillsToTeach = obj.skillsToTeach || obj.teachSkills || [];
  obj.skillsToLearn = obj.skillsToLearn || obj.learnSkills || [];

  return obj;
};

module.exports = mongoose.model('User', userSchema);
