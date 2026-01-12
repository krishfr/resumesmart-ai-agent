// backend/src/config/env.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('ENV CHECK', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING'
});

const envConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  DB_TYPE: process.env.DB_TYPE,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  
  // Ollama
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  OLLAMA_EMBEDDING_MODEL: process.env.OLLAMA_EMBEDDING_MODEL,
  
  // Application
  FRONTEND_URL: process.env.FRONTEND_URL,
  MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE, // 10MB
  
  // RAG Configuration
  CHUNK_SIZE: process.env.CHUNK_SIZE,
  CHUNK_OVERLAP: process.env.CHUNK_OVERLAP,
  TOP_K_RESULTS: process.env.TOP_K_RESULTS,
  
  // Agent Configuration
  MAX_AGENT_ITERATIONS: process.env.MAX_AGENT_ITERATIONS,
  AGENT_TIMEOUT: process.env.AGENT_TIMEOUT, // 5 minutes
};

// Validation
const requiredEnvVars = ['DB_PASSWORD'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

module.exports = { envConfig };