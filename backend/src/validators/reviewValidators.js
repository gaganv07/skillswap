const { body } = require('express-validator');
const { paginationValidator, objectIdParam } = require('./userValidators');

const ratingField = (field) =>
  body(field).optional().isFloat({ min: 1, max: 5 }).withMessage(`${field} must be between 1 and 5`);

const createReviewValidator = [
  body('revieweeId').isMongoId().withMessage('Reviewee id is required'),
  body('swapRequestId').optional().isMongoId().withMessage('Swap request id must be valid'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters'),
  ratingField('categories.communication'),
  ratingField('categories.knowledge'),
  ratingField('categories.reliability'),
];

module.exports = {
  createReviewValidator,
  reviewPaginationValidator: paginationValidator,
  reviewUserParamValidator: [objectIdParam('userId')],
};
