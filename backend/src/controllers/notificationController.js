const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc      Get user notifications
// @route     GET /api/notifications
// @access    Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [notifications, total] = await Promise.all([
    Notification.find({ userId: req.user.id })
      .populate('relatedUserId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user.id }),
  ]);

  return successResponse(res, {
    data: {
      notifications,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Mark notification as read
// @route     PUT /api/notifications/:id/read
// @access    Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return successResponse(res, {
    message: 'Notification marked as read',
    data: { notification },
  });
});

// @desc      Mark all notifications as read
// @route     PUT /api/notifications/mark-all-read
// @access    Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  return successResponse(res, {
    message: 'All notifications marked as read',
  });
});

// @desc      Get unread count
// @route     GET /api/notifications/unread-count
// @access    Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false,
  });

  return successResponse(res, {
    data: { unreadCount: count },
  });
});