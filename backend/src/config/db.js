const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('bufferCommands', false);

const dbState = {
  isConnected: false,
  lastError: null,
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      // Production-ready connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    dbState.isConnected = true;
    dbState.lastError = null;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    dbState.isConnected = false;
    dbState.lastError = error.message;
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error; // Throw error for fail-fast behavior
  }
};

mongoose.connection.on('connected', () => {
  dbState.isConnected = true;
  dbState.lastError = null;
});

mongoose.connection.on('disconnected', () => {
  dbState.isConnected = false;
});

mongoose.connection.on('error', (error) => {
  dbState.isConnected = false;
  dbState.lastError = error.message;
  logger.error(`MongoDB runtime error: ${error.message}`);
});

const getDbStatus = () => ({
  ...dbState,
  readyState: mongoose.connection.readyState,
});

module.exports = connectDB;
module.exports.getDbStatus = getDbStatus;
