// frontend/src/hooks/useAgent.js
import { useCallback } from 'react';
import useChatStore from '../store/chatStore';
import { executeAgent, createStreamConnection } from '../services/api';
import useStreaming from './useStreaming';

const useAgent = () => {
  const {
    resume,
    addMessage,
    setAgentExecuting,
    setAgentStatus,
    addToolResult,
    clearToolResults,
  } = useChatStore();
  const { handleStream } = useStreaming();

  const executeTask = useCallback(async (task, useStream = true) => {
    if (!resume) {
      throw new Error('Please upload a resume first');
    }

    addMessage({
      role: 'user',
      content: task,
    });

    setAgentExecuting(true);
    clearToolResults();
    setAgentStatus('Initializing...');

    if (useStream) {
      const streamUrl = createStreamConnection('/agent/execute/stream');
      
      try {
        await handleStream(streamUrl, {
          task,
          resumeId: resume.id,
        }, (event) => {
          if (event.type === 'status') {
            setAgentStatus(event.message);
          } else if (event.type === 'analysis') {
            setAgentStatus('Analyzing task...');
          } else if (event.type === 'plan') {
            setAgentStatus(`Planning: ${event.data.tools?.length || 0} tools`);
          } else if (event.type === 'tool_result') {
            addToolResult(event.data);
            setAgentStatus(`Completed: ${event.data.tool}`);
          } else if (event.type === 'final_response') {
            setAgentStatus('Complete');
          }
        });
      } finally {
        setAgentExecuting(false);
        setAgentStatus(null);
      }
    } else {
      try {
        const response = await executeAgent(task, resume.id);
        
        if (response.success) {
          addMessage({
            role: 'assistant',
            content: response.response,
          });
          
          response.toolResults?.forEach(result => {
            addToolResult(result);
          });
        } else {
          addMessage({
            role: 'assistant',
            content: `Error: ${response.error}`,
          });
        }
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: `Error: ${error.message}`,
        });
      } finally {
        setAgentExecuting(false);
        setAgentStatus(null);
      }
    }
  }, [resume, addMessage, setAgentExecuting, setAgentStatus, addToolResult, clearToolResults, handleStream]);

  return { executeTask };
};

export default useAgent;