const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const User = require('../models/User');

// Mock push notification service
// In production, integrate with FCM, APNs, or web push
class PushNotificationService {
  constructor() {
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }

  // Send push notification to user
  async sendNotification(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Mock implementation - in production, use FCM or web push
      console.log(`[PUSH] Sending notification to ${user.name}:`, notification);

      // Here you would:
      // 1. Check if user has push tokens
      // 2. Send to FCM/APNs/web push service
      // 3. Handle delivery status

      return { success: true, messageId: 'mock_' + Date.now() };
    } catch (error) {
      console.error('Push notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Register device token for user
  async registerToken(userId, token, platform = 'web') {
    try {
      // In production, store tokens securely
      console.log(`[PUSH] Registered ${platform} token for user ${userId}`);

      // Update user with push token
      await User.findByIdAndUpdate(userId, {
        $addToSet: { pushTokens: { token, platform, registeredAt: new Date() } }
      });

      return { success: true };
    } catch (error) {
      console.error('Token registration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification for new message
  async sendMessageNotification(recipientId, sender, message) {
    const notification = {
      title: 'New Message',
      body: `${sender.name}: ${message.content?.substring(0, 100) || 'Sent a message'}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'message',
        senderId: sender._id,
        roomId: message.roomId,
      },
    };

    return this.sendNotification(recipientId, notification);
  }

  // Send notification for request
  async sendRequestNotification(recipientId, sender) {
    const notification = {
      title: 'New Connection Request',
      body: `${sender.name} sent you a connection request`,
      icon: '/icon-192x192.png',
      data: {
        type: 'request',
        senderId: sender._id,
      },
    };

    return this.sendNotification(recipientId, notification);
  }
}

const pushService = new PushNotificationService();

// @desc      Register push token
// @route     POST /api/notifications/register-token
// @access    Private
exports.registerPushToken = asyncHandler(async (req, res) => {
  const { token, platform = 'web' } = req.body;

  if (!token) {
    throw new AppError('Token is required', 400);
  }

  const result = await pushService.registerToken(req.user.id, token, platform);

  if (!result.success) {
    throw new AppError('Failed to register token', 500);
  }

  return successResponse(res, {
    message: 'Push token registered successfully',
  });
});

// @desc      Send test notification
// @route     POST /api/notifications/test
// @access    Private
exports.sendTestNotification = asyncHandler(async (req, res) => {
  const result = await pushService.sendNotification(req.user.id, {
    title: 'Test Notification',
    body: 'This is a test push notification',
    icon: '/icon-192x192.png',
  });

  return successResponse(res, {
    message: 'Test notification sent',
    result,
  });
});

// Export service for use in other controllers
exports.pushService = pushService;