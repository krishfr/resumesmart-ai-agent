// frontend/src/store/chatStore.js
import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // =====================
  // UI Navigation State
  // =====================
  activeView: 'chat', // 'chat' | 'resume' | 'agent'
  setActiveView: (view) => set({ activeView: view }),

  // =====================
  // Resume state
  // =====================
  resume: null,
  resumeUploading: false,
  resumeError: null,

  setResume: (resume) =>
    set({
      resume,
      resumeError: null,
    }),

  setResumeUploading: (uploading) =>
    set({ resumeUploading: uploading }),

  setResumeError: (error) =>
    set({
      resumeError: error,
      resumeUploading: false,
    }),

  // =====================
  // Chat state
  // =====================
  messages: [],
  currentConversationId: null,
  isStreaming: false,
  streamingMessage: '',

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1].content = content;
      }
      return { messages };
    }),

  clearMessages: () =>
    set({
      messages: [],
      streamingMessage: '',
    }),

  setConversationId: (id) =>
    set({ currentConversationId: id }),

  // =====================
  // Streaming state
  // =====================
  setStreaming: (isStreaming) =>
    set({ isStreaming }),

  setStreamingMessage: (content) =>
    set({ streamingMessage: content }),

  appendStreamingMessage: (chunk) =>
    set((state) => ({
      streamingMessage: state.streamingMessage + chunk,
    })),

  finalizeStreamingMessage: () =>
    set((state) => {
      if (!state.streamingMessage) {
        return { isStreaming: false };
      }

      return {
        messages: [
          ...state.messages,
          {
            id: Date.now(),
            role: 'assistant',
            content: state.streamingMessage,
            timestamp: new Date().toISOString(),
          },
        ],
        streamingMessage: '',
        isStreaming: false,
      };
    }),

  // =====================
  // Agent state
  // =====================
  agentExecuting: false,
  agentStatus: null,
  toolResults: [],

  setAgentExecuting: (executing) =>
    set({ agentExecuting: executing }),

  setAgentStatus: (status) =>
    set({ agentStatus: status }),

  addToolResult: (result) =>
    set((state) => ({
      toolResults: [...state.toolResults, result],
    })),

  clearToolResults: () =>
    set({ toolResults: [] }),
}));

export default useChatStore;
