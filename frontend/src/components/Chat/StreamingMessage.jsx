// frontend/src/components/Chat/StreamingMessage.jsx
import React from 'react';
import { Bot } from 'lucide-react';

const StreamingMessage = ({ content }) => {
  return (
    <div className="flex gap-4 animate-slide-up">
      {/* Avatar with pulse */}
      <div className="flex-shrink-0 w-10 h-10">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-primary-500 rounded-xl blur-md opacity-30 animate-pulse" />
          <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/50">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Streaming content */}
      <div className="flex-1 max-w-3xl">
        <div className="relative rounded-2xl px-5 py-3.5 bg-dark-800/70 border border-dark-700/50 backdrop-blur-sm shadow-lg">
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative prose prose-invert prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed m-0 text-dark-100">
              {content}
              {/* Cursor */}
              <span className="inline-flex w-0.5 h-5 ml-1 bg-primary-500 animate-pulse" />
            </p>
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-dark-500 ml-1">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;