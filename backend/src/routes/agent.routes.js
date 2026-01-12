// backend/src/routes/agent.routes.js
const express = require('express');
const router = express.Router();

const agentController = require('../controllers/agent.controller');
const validator = require('../middleware/validator');

// Execute agent (non-stream)
router.post('/execute', agentController.execute);

// Execute agent (streaming SSE)
router.post('/execute/stream', agentController.executeStream);

// Get conversation history
router.get(
  '/history/:conversationId',
  validator.validateConversationId,
  agentController.getHistory
);

module.exports = router;
