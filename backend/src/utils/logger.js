// backend/src/utils/logger.js
const winston = require('winston');

const safeStringify = (value) => {
  try {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    return JSON.stringify(value);
  } catch {
    return '[Unserializable object]';
  }
};

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      let output = `${timestamp} [${level}]: ${safeStringify(message)}`;

      if (Object.keys(meta).length > 0) {
        output += ` ${safeStringify(meta)}`;
      }

      return output;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger;
