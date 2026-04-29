const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || process.env.BACKEND_PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap-connect',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
  jwtSecret: process.env.JWT_SECRET || 'development_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'development_refresh_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ||
      'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:3000,exp://127.0.0.1:8081'
  ),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  // Cloudinary configuration (optional)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  // OpenAI configuration (optional)
  openaiApiKey: process.env.OPENAI_API_KEY,
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

env.isProduction = env.nodeEnv === 'production';

module.exports = env;
