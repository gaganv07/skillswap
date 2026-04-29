const AppError = require('../utils/appError');
const { getDbStatus } = require('../config/db');

const requireDatabase = (req, res, next) => {
  const dbStatus = getDbStatus();

  if (dbStatus.isConnected) {
    return next();
  }

  return next(
    new AppError(
      `Database is currently unavailable${dbStatus.lastError ? `: ${dbStatus.lastError}` : ''}`,
      503
    )
  );
};

module.exports = {
  requireDatabase,
};
