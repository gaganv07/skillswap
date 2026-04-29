const express = require('express');
const router = express.Router();
const { generateBio } = require('../controllers/userController');
const { generateChatSuggestions } = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.post('/generate-bio', auth, generateBio);
router.post('/chat-assistant', auth, generateChatSuggestions);

module.exports = router;
