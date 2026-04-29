const { body, param } = require('express-validator');
const { paginationValidator } = require('./userValidators');

const sendMessageValidator = [
  body('recipientId').isMongoId().withMessage('Recipient id is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
];

const getMessagesValidator = [
  param('userId').isMongoId().withMessage('User id must be valid'),
];

module.exports = {
  sendMessageValidator,
  getMessagesValidator,
  chatPaginationValidator: paginationValidator,
};
