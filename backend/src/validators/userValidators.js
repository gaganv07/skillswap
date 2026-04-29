const { body, param, query } = require('express-validator');

const skillLevelEnum = ['beginner', 'intermediate', 'advanced'];
const availabilityEnum = ['flexible', 'weekends', 'evenings', 'limited'];

const objectIdParam = (field) =>
  param(field).isMongoId().withMessage(`${field} must be a valid id`);

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('availability').optional().isIn(availabilityEnum).withMessage('Invalid availability value'),
  body('skillsOffered').optional().isArray().withMessage('skillsOffered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('skillsWanted must be an array'),
  body('skillsOffered.*.skill').optional().trim().notEmpty().withMessage('Offered skill name is required'),
  body('skillsWanted.*.skill').optional().trim().notEmpty().withMessage('Wanted skill name is required'),
  body('skillsOffered.*.level').optional().isIn(skillLevelEnum).withMessage('Invalid skill level'),
  body('skillsWanted.*.level').optional().isIn(skillLevelEnum).withMessage('Invalid skill level'),
  body('skillsToTeach').optional().custom((value) => {
    if (Array.isArray(value) || typeof value === 'string') return true;
    throw new Error('Skills to teach must be a string or an array');
  }),
  body('skillsToLearn').optional().custom((value) => {
    if (Array.isArray(value) || typeof value === 'string') return true;
    throw new Error('Skills to learn must be a string or an array');
  }),
  body('teachSkills').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return true;
      } catch (e) {
        // Allow string values that might be comma-separated
        return true;
      }
    }
    throw new Error('teachSkills must be a valid JSON array string, array, or comma-separated string');
  }),
  body('learnSkills').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return true;
      } catch (e) {
        // Allow string values that might be comma-separated
        return true;
      }
    }
    throw new Error('learnSkills must be a valid JSON array string, array, or comma-separated string');
  }),
];

module.exports = {
  objectIdParam,
  paginationValidator,
  updateProfileValidator,
};
