// frontend/src/components/Chat/MessageList.jsx
import React, { useEffect, useRef } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import StreamingMessage from './StreamingMessage';

const MessageList = () => {
  const { messages, isStreaming, streamingMessage } = useChatStore();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg animate-fade-in">
          {/* Icon with glow */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
            <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 p-6 rounded-2xl border border-dark-700/50 shadow-2xl">
              <Bot className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Welcome to ResumeSmart AI
          </h2>
          <p className="text-dark-400 leading-relaxed mb-6">
            Upload your resume to unlock personalized career insights, intelligent job matching, 
            and AI-powered cover letter generation.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Smart Job Search', 'Cover Letters', 'Skill Analysis'].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700/50 rounded-full text-xs text-dark-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
    >
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isFirst = index === 0;
        
        return (
          <div
            key={message.id}
            className={`flex gap-4 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10">
              {isUser ? (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600/50 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-dark-300" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-primary-500 rounded-xl blur-md opacity-30" />
                  <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/50">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Message content */}
            <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
              {/* Message bubble */}
              <div
                className={`
                  relative rounded-2xl px-5 py-3.5 shadow-lg
                  ${isUser 
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-primary-900/20' 
                    : 'bg-dark-800/70 border border-dark-700/50 text-dark-100 backdrop-blur-sm'
                  }
                `}
              >
                {/* Message text */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed m-0">
                    {message.content}
                  </p>
                </div>

                {/* Timestamp */}
                <div className={`flex items-center gap-1.5 mt-2 text-xs ${
                  isUser ? 'text-primary-200/60' : 'text-dark-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Streaming message */}
      {isStreaming && streamingMessage && (
        <StreamingMessage content={streamingMessage} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;