import winston from 'winston';
import env from './env.js';

const redactSensitive = winston.format((info) => {
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'authorization', 'cookie', 'secret', 'apiKey'];
  const redactObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(copy)) {
      if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
        copy[key] = '[REDACTED]';
      } else if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = redactObject(copy[key]);
      }
    }
    return copy;
  };

  if (typeof info.message === 'object' && info.message !== null) {
    info.message = redactObject(info.message);
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSensitive(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'taskflow-pro-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || (typeof message === 'object' ? JSON.stringify(message) : message)}`;
        })
      ),
    }),
  ],
});

export default logger;
