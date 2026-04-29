const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) =>
      `${timestamp} [${level}] ${stack || message}`
    )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
