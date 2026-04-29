const http = require('http');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const logger = require('./config/logger');
const setupSocket = require('./socket/socketHandler');

// Global error handlers (must be first)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Environment validation
console.log('🔍 VALIDATING ENVIRONMENT VARIABLES...');

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Optional but recommended
if (!env.cloudinaryCloudName) {
  console.warn('⚠️  CLOUDINARY_CLOUD_NAME not set - Media upload will not work');
}

if (!env.openaiApiKey) {
  console.warn('⚠️  OPENAI_API_KEY not set - AI chat assistant will not work');
}

// Log environment status
console.log('📋 ENVIRONMENT STATUS:');
console.log('  NODE_ENV:', env.nodeEnv);
console.log('  PORT:', env.port);
console.log('  MONGO_URI:', env.mongoUri ? '✅ Set' : '❌ Missing');
console.log('  JWT_SECRET:', env.jwtSecret ? '✅ Set' : '❌ Missing');
console.log('  CLOUDINARY:', env.cloudinaryCloudName ? '✅ Configured' : '⚠️  Not configured');
console.log('  OPENAI:', env.openaiApiKey ? '✅ Configured' : '⚠️  Not configured');

// Safe startup wrapper
(async () => {
  try {
    console.log('🚀 STARTING SKILLSWAP CONNECT SERVER...');

    // Connect to MongoDB (blocking - will throw on failure)
    console.log('📡 Connecting to MongoDB...');
    const dbConnection = await connectDB();
    if (!dbConnection) {
      throw new Error('Failed to connect to MongoDB');
    }
    console.log('✅ MongoDB connected successfully');

    // Create HTTP server
    const server = http.createServer(app);
    console.log('🌐 HTTP server created');

    // Setup Socket.IO
    console.log('🔌 Setting up Socket.IO...');
    const io = setupSocket(server);
    app.locals.io = io;
    console.log('✅ Socket.IO configured');

    // Setup Cloudinary (if configured)
    if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
      console.log('☁️  Setting up Cloudinary...');
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: env.cloudinaryCloudName,
        api_key: env.cloudinaryApiKey,
        api_secret: env.cloudinaryApiSecret,
      });
      console.log('✅ Cloudinary configured');
    } else {
      console.log('☁️  Cloudinary not configured - Media uploads disabled');
    }

    // Start server
    const PORT = env.port;
    server.listen(PORT, () => {
      console.log(`🎉 SERVER STARTED SUCCESSFULLY`);
      console.log(`📍 Running on port ${PORT}`);
      console.log(`🌍 Environment: ${env.nodeEnv}`);
      console.log(`🔗 Socket.IO: Enabled`);
      logger.info(`Server running on port ${PORT} in ${env.nodeEnv} mode`);
    });

    // Server error handling
    server.on('error', (error) => {
      console.error('❌ SERVER ERROR:', error);
      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    });

  } catch (err) {
    console.error('💥 STARTUP FAILED:', err.message);
    logger.error('Startup failed:', err);
    process.exit(1);
  }
})();

module.exports = { app };
