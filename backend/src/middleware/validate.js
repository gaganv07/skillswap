const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return next(
    new AppError('Validation failed', 400, errors.array().map(({ msg, path }) => ({ field: path, message: msg })))
  );
};

module.exports = validate;
module.exports.validateRequest = validate;
