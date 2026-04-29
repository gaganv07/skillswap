const Request = require('../models/Request');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const checkConnection = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.body.receiverId;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Check if there's an accepted request between current user and target user
  const connection = await Request.findOne({
    $or: [
      { sender: req.user.id, receiver: userId, status: 'accepted' },
      { sender: userId, receiver: req.user.id, status: 'accepted' },
    ],
  });

  if (!connection) {
    return next(new AppError('You can only chat with connected users', 403));
  }

  req.connection = connection;
  next();
});

module.exports = checkConnection;