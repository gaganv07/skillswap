const { body } = require('express-validator');

const registerValidator = [
body('name')
.trim()
.notEmpty().withMessage('Name is required')
.isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

body('email')
.trim()
.notEmpty().withMessage('Email is required')
.isEmail().withMessage('Valid email is required')
.normalizeEmail({ gmail_remove_dots: false }).withMessage('Invalid email format'),

body('password')
.notEmpty().withMessage('Password is required')
.isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

body('passwordConfirm')
.notEmpty().withMessage('Confirm password is required')
.custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  }
  return true;
}),
];

const loginValidator = [
body('email')
.trim()
.notEmpty().withMessage('Email is required')
.isEmail().withMessage('Valid email is required')
.normalizeEmail(),

body('password')
.notEmpty().withMessage('Password is required')
.isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const refreshValidator = [
body('refreshToken')
.trim()
.notEmpty().withMessage('Refresh token is required'),
];

module.exports = {
registerValidator,
loginValidator,
refreshValidator,
};
