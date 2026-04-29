const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const OpenAI = require('openai');
const { generateKeyPair } = require('../utils/encryption');

const normalizeSkills = (skills = []) =>
  skills
    .map((entry) => {
      if (typeof entry === 'string') {
        return { skill: entry.trim(), level: 'beginner' };
      }

      return {
        skill: entry.skill?.trim(),
        level: entry.level || 'beginner',
      };
    })
    .filter((entry) => entry.skill);

// Initialize OpenAI client (only if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// @desc      Get user profile
// @route     GET /api/users/:id
// @access    Public
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return successResponse(res, {
    data: { user: user.toJSON() },
  });
});

// @desc      Update user profile
// @route     PUT /api/users/:id
// @route     PUT /api/users/update-profile
// @access    Private
exports.updateProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id || req.user.id;

    if (req.params.id && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const { name, bio, teachSkills, learnSkills, skillsOfferedSimple, skillsWantedSimple } = req.body;
    const updateData = {};

    // Update basic fields safely
    if (name !== undefined && name !== null) {
      updateData.name = String(name).trim();
    }
    if (bio !== undefined && bio !== null) {
      updateData.bio = String(bio).trim();
    }

    // SAFE SKILLS PARSING - prevent JSON.parse crashes
    try {
      if (teachSkills !== undefined && teachSkills !== null && teachSkills !== '') {
        const parsedTeachSkills = JSON.parse(teachSkills);
        if (Array.isArray(parsedTeachSkills)) {
          updateData.skillsToTeach = parsedTeachSkills.map(skill => String(skill).trim()).filter(Boolean);
        } else {
          console.warn('skillsToTeach is not an array:', parsedTeachSkills);
          updateData.skillsToTeach = [];
        }
      }
    } catch (error) {
      console.error('Error parsing skillsToTeach:', error.message, 'Raw value:', teachSkills);
      updateData.skillsToTeach = [];
    }

    try {
      if (learnSkills !== undefined && learnSkills !== null && learnSkills !== '') {
        const parsedLearnSkills = JSON.parse(learnSkills);
        if (Array.isArray(parsedLearnSkills)) {
          updateData.skillsToLearn = parsedLearnSkills.map(skill => String(skill).trim()).filter(Boolean);
        } else {
          console.warn('skillsToLearn is not an array:', parsedLearnSkills);
          updateData.skillsToLearn = [];
        }
      }
    } catch (error) {
      console.error('Error parsing skillsToLearn:', error.message, 'Raw value:', learnSkills);
      updateData.skillsToLearn = [];
    }

    try {
      if (skillsOfferedSimple !== undefined && skillsOfferedSimple !== null && skillsOfferedSimple !== '') {
        const parsedOfferedSkills = JSON.parse(skillsOfferedSimple);
        if (Array.isArray(parsedOfferedSkills)) {
          updateData.skillsOfferedSimple = parsedOfferedSkills.map(skill => String(skill).trim()).filter(Boolean);
        } else {
          console.warn('skillsOfferedSimple is not an array:', parsedOfferedSkills);
          updateData.skillsOfferedSimple = [];
        }
      }
    } catch (error) {
      console.error('Error parsing skillsOfferedSimple:', error.message, 'Raw value:', skillsOfferedSimple);
      updateData.skillsOfferedSimple = [];
    }

    try {
      if (skillsWantedSimple !== undefined && skillsWantedSimple !== null && skillsWantedSimple !== '') {
        const parsedWantedSkills = JSON.parse(skillsWantedSimple);
        if (Array.isArray(parsedWantedSkills)) {
          updateData.skillsWantedSimple = parsedWantedSkills.map(skill => String(skill).trim()).filter(Boolean);
        } else {
          console.warn('skillsWantedSimple is not an array:', parsedWantedSkills);
          updateData.skillsWantedSimple = [];
        }
      }
    } catch (error) {
      console.error('Error parsing skillsWantedSimple:', error.message, 'Raw value:', skillsWantedSimple);
      updateData.skillsWantedSimple = [];
    }

    // SAFE IMAGE HANDLING - prevent crashes if req.file is undefined
    if (req.file && req.file.path) {
      console.log('Image uploaded successfully:', req.file.path);
      updateData.profileImage = req.file.path;
      updateData.profilePic = req.file.path;
    } else if (req.file) {
      console.warn('File uploaded but no path available:', req.file);
    } else {
      console.log('No image file provided in request');
    }

    console.log('Update data prepared:', updateData);

    const user = await User.findByIdAndUpdate(targetUserId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// @desc      Get all users
// @route     GET /api/users
// @access    Private
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const baseQuery = { _id: { $ne: req.user.id } };
  const query = search
    ? {
        ...baseQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
          { 'skillsOffered.skill': { $regex: search, $options: 'i' } },
          { 'skillsWanted.skill': { $regex: search, $options: 'i' } },
        ],
      }
    : baseQuery;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return successResponse(res, {
    data: {
      users: users.map((user) => user.toJSON()),
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Upload profile picture
// @route     POST /api/users/upload-profile-pic
// @access    Private
exports.uploadProfilePic = async (req, res) => {
  try {
    console.log('UPLOAD PROFILE PIC REQUEST:');
    console.log('FILE:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!req.file.path) {
      console.error('File uploaded but no path available:', req.file);
      return res.status(500).json({
        success: false,
        message: 'File upload failed - no file path available'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profileImage = req.file.path;
    user.profilePic = req.file.path;
    await user.save();

    return res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profileImage: user.profileImage,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error('UPLOAD PROFILE PIC ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// @desc      Enhance bio with AI
// @route     POST /api/users/enhance-bio
// @access    Private
exports.enhanceBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;

  if (!bio || typeof bio !== 'string' || bio.trim().length === 0) {
    throw new AppError('Bio text is required', 400);
  }

  if (!process.env.OPENAI_API_KEY || !openai) {
    throw new AppError('AI service is not configured', 500);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional profile writer specializing in creating compelling, concise, and engaging bios for skill-sharing platforms. Focus on highlighting skills, experience, and personality while keeping it professional and approachable."
        },
        {
          role: "user",
          content: `Please enhance and improve this bio for a professional profile: "${bio.trim()}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const enhancedBio = response.choices[0]?.message?.content?.trim();

    if (!enhancedBio) {
      throw new AppError('Failed to generate enhanced bio', 500);
    }

    return successResponse(res, {
      message: 'Bio enhanced successfully',
      data: { enhancedBio },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new AppError('Failed to enhance bio. Please try again later.', 500);
  }
});

// @desc      Generate encryption keys for E2EE
// @route     POST /api/users/generate-keys
// @access    Private
exports.generateEncryptionKeys = asyncHandler(async (req, res) => {
  const { generateKeyPair } = require('../utils/encryption');

  // Generate key pair
  const keyPair = await generateKeyPair();

  // Store public key (safe to store)
  // Private key should be encrypted client-side and stored securely
  await User.findByIdAndUpdate(req.user.id, {
    publicKey: keyPair.publicKey,
  });

  return successResponse(res, {
    message: 'Encryption keys generated successfully',
    data: {
      publicKey: keyPair.publicKey,
      // Note: Private key is not sent to server for security
      // Client should store it securely (encrypted localStorage/IndexedDB)
    },
  });
});

// @desc      Get user's public key
// @route     GET /api/users/:userId/public-key
// @access    Private
exports.getPublicKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('publicKey');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return successResponse(res, {
    data: { publicKey: user.publicKey },
  });
});

// @desc      Generate bio with AI based on skills
// @route     POST /api/users/generate-bio
// @access    Private
exports.generateBio = asyncHandler(async (req, res) => {
  const { name, teachSkills, learnSkills } = req.body;

  if (!name || !teachSkills || !learnSkills) {
    throw new AppError('Name, teach skills, and learn skills are required', 400);
  }

  if (!process.env.OPENAI_API_KEY || !openai) {
    // Mock response if OpenAI is not available
    const mockBio = `${name} is passionate about sharing knowledge in ${Array.isArray(teachSkills) ? teachSkills.slice(0, 2).join(' and ') : teachSkills}. Currently exploring ${Array.isArray(learnSkills) ? learnSkills.slice(0, 2).join(' and ') : learnSkills} to expand their skill set. Always eager to connect with fellow learners and create meaningful skill exchanges.`;
    
    return successResponse(res, {
      message: 'Bio generated successfully',
      data: { bio: mockBio },
    });
  }

  try {
    const teachSkillsText = Array.isArray(teachSkills) ? teachSkills.join(', ') : teachSkills;
    const learnSkillsText = Array.isArray(learnSkills) ? learnSkills.join(', ') : learnSkills;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional bio writer for a skill-sharing platform. Create a concise, engaging, and professional bio (2-3 sentences) that highlights the person's teaching skills and learning interests. Make it sound approachable and enthusiastic about skill exchange."
        },
        {
          role: "user",
          content: `Write a professional bio for ${name} who can teach: ${teachSkillsText} and wants to learn: ${learnSkillsText}.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const generatedBio = response.choices[0]?.message?.content?.trim();

    if (!generatedBio) {
      throw new AppError('Failed to generate bio', 500);
    }

    return successResponse(res, {
      message: 'Bio generated successfully',
      data: { bio: generatedBio },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new AppError('Failed to generate bio. Please try again later.', 500);
  }
});

