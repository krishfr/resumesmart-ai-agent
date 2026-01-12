// backend/src/services/rag.service.js
const Resume = require('../models/Resume');
const ResumeChunk = require('../models/ResumeChunk');
const embeddingService = require('./embedding.service');
const pdfService = require('./pdf.service');
const chunker = require('../utils/chunker');
const logger = require('../utils/logger');
const { SYSTEM_PROMPTS, USER_PROMPTS } = require('../utils/prompts');
const { generateCompletion } = require('../config/ollama');

class RAGService {
  async processResume(resumeId, filePath) {
    try {
      // Update status
      await Resume.updateProcessingStatus(resumeId, 'processing');
      
      // Extract text from PDF
      logger.info(`Extracting text from resume ${resumeId}`);
      const { text, pages } = await pdfService.extractText(filePath);
      
      // Extract structured data
      const structuredData = await pdfService.extractStructuredData(text);
      
      // Chunk the text
      logger.info(`Chunking resume text`);
      const chunks = chunker.chunkBySection(text);
      
      // Generate embeddings and store chunks
      logger.info(`Generating embeddings for ${chunks.length} chunks`);
      for (const chunk of chunks) {
        const embedding = await embeddingService.generateEmbedding(chunk.text);
        
        await ResumeChunk.create(
          resumeId,
          chunk.text,
          chunk.index,
          embedding,
          { section: chunk.section, length: chunk.length }
        );
      }
      
      // Update resume with metadata
      await Resume.updateProcessingStatus(resumeId, 'completed');
      
      logger.info(`Resume ${resumeId} processed successfully`);
      
      return {
        success: true,
        chunksCreated: chunks.length,
        pages,
        structuredData
      };
    } catch (error) {
      logger.error(`Failed to process resume ${resumeId}:`, error);
      await Resume.updateProcessingStatus(resumeId, 'failed', error.message);
      throw error;
    }
  }

  async queryResume(resumeId, query, topK = 5) {
    try {
      // Generate query embedding
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      // Search for similar chunks
      const similarChunks = await ResumeChunk.searchSimilar(
        queryEmbedding,
        resumeId,
        topK
      );
      
      if (similarChunks.length === 0) {
        return {
          answer: "I don't have enough information in your resume to answer that question.",
          chunks: [],
          confidence: 0
        };
      }
      
      // Build context from chunks
      const context = similarChunks
        .map((chunk, idx) => `[${idx + 1}] ${chunk.chunk_text}`)
        .join('\n\n');
      
      // Generate response using LLM
      const prompt = USER_PROMPTS.RAG_QUERY(query, context);
      const response = await generateCompletion(prompt, SYSTEM_PROMPTS.RAG_ASSISTANT);
      
      return {
        answer: response.response,
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
      
      // Get all chunks for full context
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
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    const similarChunks = await ResumeChunk.searchSimilar(queryEmbedding, resumeId, 5);
    
    const context = similarChunks
      .map((chunk, idx) => `[${idx + 1}] ${chunk.chunk_text}`)
      .join('\n\n');
    
    const prompt = USER_PROMPTS.RAG_QUERY(query, context);
    
    return {
      prompt,
      systemPrompt: SYSTEM_PROMPTS.RAG_ASSISTANT,
      chunks: similarChunks
    };
  }
}

module.exports = new RAGService();