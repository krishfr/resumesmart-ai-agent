// backend/src/controllers/agent.controller.js
const agentService = require('../services/agent.service');
const Resume = require('../models/Resume');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

class AgentController {
  async execute(req, res, next) {
    try {
      const { task, resumeId, conversationId } = req.body;

      if (!task) {
        return res.status(400).json({ error: 'task is required' });
      }

      let userProfile = {};
      if (resumeId) {
        const resume = await Resume.findById(resumeId);
        if (resume?.metadata) {
          userProfile = resume.metadata;
        }
      }

      const result = await agentService.executeAgent(
        task,
        resumeId,
        userProfile
      );

      if (conversationId && result.success) {
        await Conversation.addMessage(conversationId, 'user', task);
        await Conversation.addMessage(
          conversationId,
          'assistant',
          result.response,
          { toolResults: result.toolResults }
        );
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async executeStream(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const { task, resumeId } = req.body;

      if (!task) {
        res.write('data: Task is required\n\n');
        return res.end();
      }

      let userProfile = {};
      if (resumeId) {
        const resume = await Resume.findById(resumeId);
        if (resume?.metadata) {
          userProfile = resume.metadata;
        }
      }

      const stream = agentService.streamAgentExecution(
        task,
        resumeId,
        userProfile
      );

      for await (const chunk of stream) {
  if (!chunk) continue;

  // Convert event object to readable text
  if (typeof chunk === 'string') {
    res.write(`data: ${chunk}\n\n`);
  } 
  else if (chunk.type === 'status' && chunk.message) {
    res.write(`data: ${chunk.message}\n\n`);
  } 
  else if (chunk.type === 'analysis') {
    res.write(`data: Task analysis completed\n\n`);
  } 
  else if (chunk.type === 'plan') {
    res.write(`data: Tool plan ready\n\n`);
  } 
  else if (chunk.type === 'tool_result') {
    res.write(`data: Tool executed\n\n`);
  } 
  else if (chunk.type === 'final_response' && chunk.data?.response) {
    res.write(`data: ${chunk.data.response}\n\n`);
  }
}

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      logger.error('Agent stream error:', error);
      res.write(`data: ERROR: ${error.message}\n\n`);
      res.end();
    }
  }

  async getHistory(req, res, next) {
    try {
      const { conversationId } = req.params;

      const messages = await Conversation.getMessages(conversationId);

      res.json({
        success: true,
        messages
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgentController();
