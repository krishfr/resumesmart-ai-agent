// frontend/src/hooks/useChat.js
import { useCallback } from 'react';
import useChatStore from '../store/chatStore';
import { queryResume, createStreamConnection } from '../services/api';
import useStreaming from './useStreaming';

const useChat = () => {
  const { resume, addMessage, setStreaming } = useChatStore();
  const { handleStream } = useStreaming();

  const sendMessage = useCallback(async (message, useStream = true) => {
    if (!resume) {
      throw new Error('Please upload a resume first');
    }

    addMessage({
      role: 'user',
      content: message,
    });

    if (useStream) {
      const streamUrl = createStreamConnection('/rag/query/stream');
      
      await handleStream(streamUrl, {
        resumeId: resume.id,
        query: message,
      });
    } else {
      try {
        const response = await queryResume(resume.id, message);
        addMessage({
          role: 'assistant',
          content: response.answer,
        });
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: `Error: ${error.message}`,
        });
      }
    }
  }, [resume, addMessage, handleStream]);

  return { sendMessage };
};

export default useChat;