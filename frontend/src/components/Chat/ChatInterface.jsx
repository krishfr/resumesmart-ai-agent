// frontend/src/components/Chat/ChatInterface.jsx
import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AgentStatus from '../Agent/AgentStatus';

const ChatInterface = () => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-dark-950 via-dark-950 to-dark-900">
      {/* Messages area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList />
        
        {/* Agent status (appears above input) */}
        <div className="px-6 pb-3">
          <AgentStatus />
        </div>
      </div>

      {/* Input area */}
      <MessageInput />
    </div>
  );
};

export default ChatInterface;