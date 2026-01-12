// backend/src/services/embedding.service.js
const { generateEmbedding } = require('../config/ollama');
const logger = require('../utils/logger');

class EmbeddingService {
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }
      
      // Clean and normalize text
      const cleanText = this.cleanText(text);
      
      // Generate embedding
      const embedding = await generateEmbedding(cleanText);
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding response');
      }
      
      return embedding;
    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw error;
    }
  }

  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        logger.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`);
        embeddings.push(null);
      }
    }
    
    return embeddings;
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,;:!?-]/g, '')
      .trim();
  }
}

module.exports = new EmbeddingService();