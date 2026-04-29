const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getRoomMessages,
  sendRoomMessage,
  markRoomAsRead,
  getChatRooms,
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');
const checkConnection = require('../middleware/checkConnection');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../validators/userValidators');

// Room-based chat (new system)
router.get('/rooms', auth, getChatRooms);
router.get('/room/:roomId', auth, getRoomMessages);
router.post('/room', auth, sendRoomMessage);
router.put('/room/:roomId/read', auth, markRoomAsRead);

// Legacy direct messaging (backward compatibility)
router.post('/', auth, sendMessage);
router.get('/:userId', auth, objectIdParam('userId'), validate, checkConnection, getMessages);

module.exports = router;
