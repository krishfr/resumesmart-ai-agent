// backend/src/controllers/enhanced-error-wrapper.js
const { asyncHandler } = require('../middleware/errorHandler');
const streamHandler = require('../utils/streamHandler');

// Wrap all controller methods with async error handling
const wrapController = (controller) => {
  const wrapped = {};
  
  for (const [key, value] of Object.entries(controller)) {
    if (typeof value === 'function' && key !== 'getUploadMiddleware') {
      wrapped[key] = asyncHandler(value.bind(controller));
    } else {
      wrapped[key] = value;
    }
  }
  
  return wrapped;
};

// Enhanced streaming error handling
const safeStreamHandler = (streamFunction) => {
  return async (req, res, next) => {
    try {
      streamHandler.setupSSE(res);
      streamHandler.handleClientDisconnect(req, res);
      
      await streamFunction(req, res, next);
      
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      } else {
        streamHandler.sendError(res, error);
        res.end();
      }
    }
  };
};

module.exports = {
  wrapController,
  safeStreamHandler
};