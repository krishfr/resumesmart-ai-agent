// backend/src/utils/streamHandler.js
const logger = require('./logger');

class StreamHandler {
  setupSSE(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();
  }

  sendEvent(res, event) {
    try {
      const data = JSON.stringify(event);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      logger.error('Failed to send SSE event:', error);
    }
  }

  sendError(res, error) {
    this.sendEvent(res, {
      type: 'error',
      message: error.message || 'An error occurred'
    });
  }

  sendComplete(res) {
    this.sendEvent(res, { type: 'complete' });
    res.end();
  }

  handleOllamaStream(ollamaResponse, res, onToken, onComplete) {
    ollamaResponse.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.response) {
            if (onToken) {
              onToken(parsed.response);
            }
            this.sendEvent(res, {
              type: 'token',
              data: parsed.response
            });
          }
          
          if (parsed.done) {
            if (onComplete) {
              onComplete();
            }
            this.sendComplete(res);
          }
        } catch (e) {
          logger.debug('Skipped invalid JSON in stream');
        }
      }
    });

    ollamaResponse.data.on('error', (error) => {
      logger.error('Ollama stream error:', error);
      this.sendError(res, error);
      res.end();
    });

    ollamaResponse.data.on('end', () => {
      if (!res.writableEnded) {
        this.sendComplete(res);
      }
    });
  }

  async *parseOllamaStream(ollamaResponse) {
    for await (const chunk of ollamaResponse.data) {
      const lines = chunk.toString().split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.response) {
            yield { type: 'token', data: parsed.response };
          }
          
          if (parsed.done) {
            yield { type: 'done' };
            return;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  handleClientDisconnect(req, res, cleanup) {
    req.on('close', () => {
      logger.info('Client disconnected from stream');
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
      if (!res.writableEnded) {
        res.end();
      }
    });
  }
}

module.exports = new StreamHandler();