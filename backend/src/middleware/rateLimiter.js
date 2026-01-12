// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
});

// Strict rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 AI requests per hour
  message: 'AI request limit exceeded',
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: 'AI request limit exceeded. Please try again in an hour.'
    });
  }
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded',
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip
    });
    res.status(429).json({
      success: false,
      error: 'Upload limit exceeded. Please try again later.'
    });
  }
});

// Streaming endpoint limiter
const streamLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 streaming requests per hour
  message: 'Streaming request limit exceeded',
  handler: (req, res) => {
    logger.warn('Stream rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: 'Streaming limit exceeded. Please try again later.'
    });
  }
});

// Create custom rate limiter
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

module.exports = apiLimiter;
module.exports.aiLimiter = aiLimiter;
module.exports.uploadLimiter = uploadLimiter;
module.exports.streamLimiter = streamLimiter;
module.exports.createRateLimiter = createRateLimiter;