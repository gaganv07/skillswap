const logger = require('../config/logger');
const AppError = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) =>
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const error =
    err.details ||
    (!req.app.get('envIsProduction') && err.stack ? err.stack : null);

  logger.error(`${req.method} ${req.originalUrl} -> ${message}`, err);

  return errorResponse(res, {
    statusCode,
    message,
    error,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
