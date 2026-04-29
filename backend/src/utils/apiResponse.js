const successResponse = (res, { statusCode = 200, message = 'Request successful', data = null } = {}) =>
  res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });

const errorResponse = (res, { statusCode = 500, message = 'Request failed', error = null, data = null } = {}) =>
  res.status(statusCode).json({
    success: false,
    data,
    message,
    error,
  });

module.exports = {
  successResponse,
  errorResponse,
};
