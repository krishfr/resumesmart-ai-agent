const axios = require('axios');
const { envConfig } = require('./env');
const logger = require('../utils/logger');

let ollamaClient;

const initializeOllama = async () => {
  ollamaClient = axios.create({
    baseURL: envConfig.OLLAMA_BASE_URL,
    timeout: 300000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  try {
    const response = await ollamaClient.get('/api/tags');
    const models = response.data.models || [];

    const hasMainModel = models.some(m =>
      m.name.includes(envConfig.OLLAMA_MODEL)
    );

    const hasEmbeddingModel = models.some(m =>
      m.name.includes(envConfig.OLLAMA_EMBEDDING_MODEL)
    );

    if (!hasMainModel) {
      logger.info(`Pulling model: ${envConfig.OLLAMA_MODEL}`);
      await pullModel(envConfig.OLLAMA_MODEL);
    }

    if (!hasEmbeddingModel) {
      logger.info(`Pulling embedding model: ${envConfig.OLLAMA_EMBEDDING_MODEL}`);
      await pullModel(envConfig.OLLAMA_EMBEDDING_MODEL);
    }

    logger.info('Ollama connection verified');
  } catch (error) {
    logger.error('Ollama initialization failed:', error.message);
    throw new Error('Failed to connect to Ollama. Ensure Ollama is running.');
  }
};

const pullModel = async (modelName) => {
  await ollamaClient.post('/api/pull', { name: modelName });
};

const generateCompletion = async (prompt, systemPrompt = '', stream = false) => {
  const response = await ollamaClient.post(
    '/api/generate',
    {
      model: envConfig.OLLAMA_MODEL,
      prompt,
      system: systemPrompt,
      stream,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        num_predict: 2000
      }
    },
    {
      responseType: stream ? 'stream' : 'json'
    }
  );

  return response.data;
};

const generateEmbedding = async (text) => {
  const response = await ollamaClient.post('/api/embeddings', {
    model: envConfig.OLLAMA_EMBEDDING_MODEL,
    prompt: text
  });

  return response.data.embedding;
};

const getOllamaClient = () => {
  if (!ollamaClient) {
    throw new Error('Ollama client not initialized');
  }
  return ollamaClient;
};

module.exports = {
  initializeOllama,
  generateCompletion,
  generateEmbedding,
  getOllamaClient
};
