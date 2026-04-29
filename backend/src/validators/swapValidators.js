const { body, param } = require('express-validator');
const { paginationValidator } = require('./userValidators');

const skillLevelEnum = ['beginner', 'intermediate', 'advanced'];
const statusEnum = ['pending', 'accepted', 'completed', 'rejected', 'cancelled'];

const createSwapValidator = [
  body('responderId').isMongoId().withMessage('Responder id is required'),
  body('requesterSkill.skill').trim().notEmpty().withMessage('Requester skill is required'),
  body('requesterSkill.level').optional().isIn(skillLevelEnum).withMessage('Invalid requester skill level'),
  body('responderSkill.skill').trim().notEmpty().withMessage('Responder skill is required'),
  body('responderSkill.level').optional().isIn(skillLevelEnum).withMessage('Invalid responder skill level'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('proposedDate').optional().isISO8601().withMessage('Proposed date must be a valid date'),
];

const updateSwapValidator = [
  param('id').isMongoId().withMessage('Swap request id must be valid'),
  body('status').isIn(statusEnum).withMessage('Invalid status'),
];

module.exports = {
  createSwapValidator,
  updateSwapValidator,
  swapPaginationValidator: paginationValidator,
};
