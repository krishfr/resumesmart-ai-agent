// backend/src/middleware/validator.js
const { AppError } = require('./errorHandler');

class Validator {
  validateRAGQuery(req, res, next) {
    const { resumeId, query } = req.body;

    const errors = [];

    if (!resumeId) {
      errors.push('resumeId is required');
    }

    if (typeof resumeId !== 'number' && typeof resumeId !== 'string') {
      errors.push('resumeId must be a number or string');
    }

    if (!query) {
      errors.push('query is required');
    }

    if (typeof query !== 'string') {
      errors.push('query must be a string');
    }

    if (query && query.trim().length === 0) {
      errors.push('query cannot be empty');
    }

    if (query && query.length > 1000) {
      errors.push('query too long (max 1000 characters)');
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(', '), 400));
    }

    next();
  }

  validateAgentTask(req, res, next) {
    const { task, resumeId } = req.body;

    const errors = [];

    if (!task) {
      errors.push('task is required');
    }

    if (typeof task !== 'string') {
      errors.push('task must be a string');
    }

    if (task && task.trim().length === 0) {
      errors.push('task cannot be empty');
    }

    if (task && task.length > 2000) {
      errors.push('task too long (max 2000 characters)');
    }

    if (resumeId && typeof resumeId !== 'number' && typeof resumeId !== 'string') {
      errors.push('resumeId must be a number or string');
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(', '), 400));
    }

    next();
  }

  validateResumeId(req, res, next) {
    const resumeId = req.params.resumeId || req.body.resumeId;

    if (!resumeId) {
      return next(new AppError('resumeId is required', 400));
    }

    if (typeof resumeId !== 'number' && typeof resumeId !== 'string') {
      return next(new AppError('resumeId must be a number or string', 400));
    }

    next();
  }

  validateConversationId(req, res, next) {
    const conversationId = req.params.conversationId || req.body.conversationId;

    if (!conversationId) {
      return next(new AppError('conversationId is required', 400));
    }

    if (typeof conversationId !== 'number' && typeof conversationId !== 'string') {
      return next(new AppError('conversationId must be a number or string', 400));
    }

    next();
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS tags
      .substring(0, 5000); // Limit length
  }

  sanitizeInput(data) {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }
}

module.exports = new Validator();