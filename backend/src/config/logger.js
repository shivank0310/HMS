const winston = require('winston');
const appConfig = require('./index');

const logger = winston.createLogger({
  level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      if (stack) return `${timestamp} [${level}] ${message}\n${stack}`;
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
