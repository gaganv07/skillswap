const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { issueAuthTokens, rotateRefreshToken, revokeRefreshToken, hashToken } = require('../services/tokenService');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate required fields
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      lastLoginAt: new Date(),
    });

    const tokens = await issueAuthTokens(user);

    console.log('User registered successfully:', user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toJSON(),
        tokens,
      },
    });

  } catch (error) {
    console.error('REGISTRATION ERROR:', error);

    // Handle MongoDB duplicate key error (11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      console.log('Duplicate email registration attempt:', error.keyValue?.email);
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user) {
      console.log('Login attempt with non-existent email:', email.toLowerCase().trim());
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      console.log('Login attempt with invalid password for email:', email.toLowerCase().trim());
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const tokens = await issueAuthTokens(user);

    console.log('User logged in successfully:', user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens,
      },
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('getMe called for non-existent user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: { user: user.toJSON() },
    });

  } catch (error) {
    console.error('GET ME ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const targetUser = await User.findOne({
    'refreshTokens.tokenHash': hashToken(refreshToken)
  }).select('+refreshTokens +refreshTokens.tokenHash +refreshTokens.expiresAt');

  if (!targetUser) {
    throw new AppError('Refresh token expired or revoked', 401);
  }

  const tokens = await rotateRefreshToken(targetUser, refreshToken);

  return successResponse(res, {
    message: 'Token refreshed successfully',
    data: { tokens },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user.id).select('+refreshTokens +refreshTokens.tokenHash +refreshTokens.expiresAt');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (refreshToken) {
    await revokeRefreshToken(user, refreshToken);
  }

  return successResponse(res, {
    message: 'Logged out successfully',
    data: null,
  });
});
