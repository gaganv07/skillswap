const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    errorResponse(res, {
      statusCode: 429,
      message: 'Too many requests, please try again later.',
      error: [{ code: 'RATE_LIMIT_EXCEEDED' }],
    }),
});

module.exports = apiLimiter;
