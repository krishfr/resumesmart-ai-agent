// backend/src/services/rag.service.js
const { analyzeResume } = require("./aiService");
const { generateEmbedding } = require("./embedding.service");
const Resume = require('../models/Resume');
const ResumeChunk = require('../models/ResumeChunk');
const pdfService = require('./pdf.service');
const chunker = require('../utils/chunker');
const logger = require('../utils/logger');

class RAGService {
  async processResume(resumeId, filePath) {
    try {
      await Resume.updateProcessingStatus(resumeId, 'processing');

      logger.info(`Extracting text from resume ${resumeId}`);
      const { text, pages } = await pdfService.extractText(filePath);

      logger.info(`Chunking resume text`);
      const chunks = chunker.chunkBySection(text);

      logger.info(`Generating embeddings for ${chunks.length} chunks`);

      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);

        await ResumeChunk.create(
          resumeId,
          chunk.text,
          chunk.index,
          embedding,
          { section: chunk.section, length: chunk.length }
        );
      }

      await Resume.updateProcessingStatus(resumeId, 'completed');

      logger.info(`Resume ${resumeId} processed successfully`);

      return {
        success: true,
        chunksCreated: chunks.length,
        pages
      };
    } catch (error) {
      logger.error(`Failed to process resume ${resumeId}:`, error);
      await Resume.updateProcessingStatus(resumeId, 'failed', error.message);
      throw error;
    }
  }

  async queryResume(resumeId, query, topK = 5) {
    try {
      const queryEmbedding = await generateEmbedding(query);

      const similarChunks = await ResumeChunk.searchSimilar(
        queryEmbedding,
        resumeId,
        topK
      );

      if (similarChunks.length === 0) {
        return {
          answer: "Not enough data found in resume.",
          chunks: [],
          confidence: 0
        };
      }

      const context = similarChunks
        .map((chunk, idx) => `[${idx + 1}] ${chunk.chunk_text}`)
        .join('\n\n');

      const prompt = `Answer based on resume:\n\n${context}\n\nQuestion: ${query}`;

      const response = await analyzeResume(prompt);

      return {
        answer: response,
        chunks: similarChunks.map(c => ({
          text: c.chunk_text,
          similarity: c.similarity,
          section: c.metadata?.section
        })),
        confidence: similarChunks[0].similarity
      };
    } catch (error) {
      logger.error('RAG query failed:', error);
      throw error;
    }
  }

  async getResumeContext(resumeId, query = null) {
    try {
      if (query) {
        return await this.queryResume(resumeId, query);
      }

      const chunks = await ResumeChunk.findByResumeId(resumeId);

      const fullContext = chunks
        .sort((a, b) => a.chunk_index - b.chunk_index)
        .map(c => c.chunk_text)
        .join('\n\n');

      return {
        context: fullContext,
        chunks: chunks.length
      };
    } catch (error) {
      logger.error('Failed to get resume context:', error);
      throw error;
    }
  }

  async streamResponse(resumeId, query) {
    const queryEmbedding = await generateEmbedding(query);
    const similarChunks = await ResumeChunk.searchSimilar(queryEmbedding, resumeId, 5);

    const context = similarChunks
      .map((chunk, idx) => `[${idx + 1}] ${chunk.chunk_text}`)
      .join('\n\n');

    const prompt = `Answer based on resume:\n\n${context}\n\nQuestion: ${query}`;

    return {
      prompt,
      chunks: similarChunks
    };
  }
}

module.exports = new RAGService();