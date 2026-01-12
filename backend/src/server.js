// backend/src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { envConfig } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { initializeOllama } = require('./config/ollama');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const ragRoutes = require('./routes/rag.routes');
const agentRoutes = require('./routes/agent.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
// Add to existing server.js after line: const app = express();

// Import rate limiters
const { aiLimiter, uploadLimiter, streamLimiter } = require('./middleware/rateLimiter');

// After existing middleware setup, before routes:

// Apply specific rate limiters to routes
app.use('/api/rag/query/stream', streamLimiter);
app.use('/api/agent/execute/stream', streamLimiter);
app.use('/api/rag', aiLimiter);
app.use('/api/agent', aiLimiter);
app.use('/api/upload', uploadLimiter);

// Routes (keep existing route registrations as they are)
// Security middleware
app.use(helmet());
app.use(cors({
  origin: envConfig.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: envConfig.NODE_ENV
  });
});

// API Routes
app.use('/api/rag', ragRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize Ollama
    await initializeOllama();
    logger.info('Ollama initialized successfully');

    const PORT = envConfig.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${envConfig.NODE_ENV} mode`);
      logger.info(`Frontend URL: ${envConfig.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;