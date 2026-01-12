// backend/src/controllers/rag.controller.js
const ragService = require('../services/rag.service');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

class RAGController {
  async query(req, res, next) {
    try {
      const { resumeId, query } = req.body;
      
      if (!resumeId || !query) {
        return res.status(400).json({
          error: 'resumeId and query are required'
        });
      }
      
      // Verify resume exists
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      
      if (resume.processing_status !== 'completed') {
        return res.status(400).json({
          error: 'Resume is still being processed'
        });
      }
      
      const result = await ragService.queryResume(resumeId, query);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async queryStream(req, res, next) {
    try {
      const { resumeId, query } = req.body;
      
      if (!resumeId || !query) {
        return res.status(400).json({
          error: 'resumeId and query are required'
        });
      }
      
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const { prompt, systemPrompt, chunks } = await ragService.streamResponse(resumeId, query);
      
      // Send chunks info first
      res.write(`data: ${JSON.stringify({ type: 'chunks', data: chunks.length })}\n\n`);
      
      // Stream the completion
      const { getOllamaClient } = require('../config/ollama');
      const ollamaClient = getOllamaClient();
      
      const response = await ollamaClient.post('/api/generate', {
        model: require('../config/env').envConfig.OLLAMA_MODEL,
        prompt: prompt,
        system: systemPrompt,
        stream: true
      }, {
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              res.write(`data: ${JSON.stringify({ type: 'token', data: parsed.response })}\n\n`);
            }
            if (parsed.done) {
              res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
      
      response.data.on('end', () => {
        res.end();
      });
      
      response.data.on('error', (error) => {
        logger.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      });
      
    } catch (error) {
      next(error);
    }
  }

  async getContext(req, res, next) {
    try {
      const { resumeId } = req.params;
      const { query } = req.query;
      
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      
      const context = await ragService.getResumeContext(resumeId, query);
      
      res.json({
        success: true,
        ...context
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RAGController();