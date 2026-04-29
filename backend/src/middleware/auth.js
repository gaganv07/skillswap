const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

exports.auth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }

  if (decoded.type !== 'access') {
    throw new AppError('Invalid access token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User associated with this token no longer exists', 401);
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
  };

  return next();
});
