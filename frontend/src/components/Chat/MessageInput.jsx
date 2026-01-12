// frontend/src/components/Chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useChat from '../../hooks/useChat';

const MessageInput = () => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { resume, isStreaming } = useChatStore();
  const { sendMessage } = useChat();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const message = input.trim();
    setInput('');

    try {
      await sendMessage(message, true);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-panel border-t border-dark-800/50 px-6 py-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={`
          relative transition-all duration-300
          ${isFocused ? 'scale-[1.01]' : ''}
        `}>
          {/* Glow effect when focused */}
          {isFocused && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl blur opacity-20" />
          )}

          <div className="relative flex items-end gap-3 bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 backdrop-blur-sm">
            {/* AI indicator */}
            {resume && (
              <div className="flex-shrink-0 self-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">AI Ready</span>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                resume
                  ? 'Ask anything about your resume...'
                  : 'Upload a resume to start chatting'
              }
              disabled={!resume || isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-dark-100 text-sm placeholder-dark-500 resize-none focus:outline-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '24px' }}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || !resume || isStreaming}
              className="flex-shrink-0 relative group"
            >
              <div className={`
                absolute inset-0 bg-primary-500 rounded-lg blur-lg opacity-0 
                transition-opacity duration-300
                ${!input.trim() || !resume || isStreaming ? '' : 'group-hover:opacity-30'}
              `} />
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-lg
                transition-all duration-200
                ${!input.trim() || !resume || isStreaming
                  ? 'bg-dark-700/50 text-dark-600 cursor-not-allowed'
                  : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-900/30 hover:shadow-xl hover:shadow-primary-900/40 hover:scale-105'
                }
              `}>
                {isStreaming ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-dark-500">
            <kbd className="px-2 py-0.5 bg-dark-800/50 border border-dark-700/50 rounded text-dark-400 font-mono">Enter</kbd> to send · 
            <kbd className="px-2 py-0.5 bg-dark-800/50 border border-dark-700/50 rounded text-dark-400 font-mono ml-1">Shift + Enter</kbd> for new line
          </p>
          {input.length > 0 && (
            <p className="text-xs text-dark-500">
              {input.length} / 2000
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;