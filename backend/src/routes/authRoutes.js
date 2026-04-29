const express = require('express');
const { validateRequest } = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post(
  '/register',
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login
);

// Protected routes
router.get('/me', auth, authController.getMe);
router.post('/refresh', authController.refresh);
router.post('/logout', auth, authController.logout);

module.exports = router;
