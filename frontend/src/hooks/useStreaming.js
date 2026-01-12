// frontend/src/hooks/useStreaming.js
import { useCallback } from 'react';
import useChatStore from '../store/chatStore';

const useStreaming = () => {
  const {
    setStreaming,
    setStreamingMessage,
    appendStreamingMessage,
    finalizeStreamingMessage,
  } = useChatStore();

  const handleStream = useCallback(async (url, body, onEvent) => {
    try {
      setStreaming(true);
      setStreamingMessage('');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'token') {
                appendStreamingMessage(data.data);
              } else if (data.type === 'done' || data.type === 'complete') {
                finalizeStreamingMessage();
              } else if (onEvent) {
                onEvent(data);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      if (!finalizeStreamingMessage.done) {
        finalizeStreamingMessage();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setStreaming(false);
      throw error;
    }
  }, [setStreaming, setStreamingMessage, appendStreamingMessage, finalizeStreamingMessage]);

  return { handleStream };
};

export default useStreaming;