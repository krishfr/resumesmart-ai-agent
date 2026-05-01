// backend/src/controllers/rag.controller.js

const ragService = require('../services/rag.service');
const Resume = require('../models/Resume');

class RAGController {

  async query(req, res, next) {
    try {
      const { resumeId, query } = req.body;

      if (!resumeId || !query) {
        return res.status(400).json({
          error: 'resumeId and query are required'
        });
      }

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

      return res.json({
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

      const resume = await Resume.findById(resumeId);

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      if (resume.processing_status !== 'completed') {
        return res.status(400).json({
          error: 'Resume is still being processed'
        });
      }

      // SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await ragService.queryResume(resumeId, query);

      // Send chunks count
      res.write(`data: ${JSON.stringify({ type: 'chunks', data: result.chunks.length })}\n\n`);

      // Simulate streaming response (token by token)
      const words = result.answer.split(' ');

      for (let i = 0; i < words.length; i++) {
        res.write(`data: ${JSON.stringify({ type: 'token', data: words[i] + ' ' })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Done signal
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

      res.end();

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

      return res.json({
        success: true,
        ...context
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RAGController();