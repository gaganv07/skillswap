const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { registerPushToken, sendTestNotification } = require('../services/pushService');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../validators/userValidators');

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/:id/read', auth, objectIdParam('id'), validate, markAsRead);
router.put('/mark-all-read', auth, markAllAsRead);

// Push notification routes
router.post('/register-token', auth, registerPushToken);
router.post('/test', auth, sendTestNotification);

module.exports = router;