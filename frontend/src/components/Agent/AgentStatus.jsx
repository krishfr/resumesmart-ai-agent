// frontend/src/components/Agent/AgentStatus.jsx
import React from 'react';
import { Loader, CheckCircle, Zap, Brain, Search, FileText, TrendingUp } from 'lucide-react';
import useChatStore from '../../store/chatStore';

const AgentStatus = () => {
  const { agentExecuting, agentStatus, toolResults } = useChatStore();

  if (!agentExecuting && !agentStatus) return null;

  const getStatusIcon = () => {
    if (!agentStatus) return Brain;
    
    const status = agentStatus.toLowerCase();
    if (status.includes('search')) return Search;
    if (status.includes('cover')) return FileText;
    if (status.includes('skill') || status.includes('analysis')) return TrendingUp;
    return Brain;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="max-w-4xl mx-auto w-full animate-slide-up">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500/10 via-primary-600/5 to-transparent border border-primary-500/20 backdrop-blur-sm">
        {/* Animated background */}
        {agentExecuting && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-600/10 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
        )}

        <div className="relative px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div className="flex-shrink-0">
              {agentExecuting ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500 rounded-lg blur-md opacity-40 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg">
                    <Loader className="w-5 h-5 text-white animate-spin" />
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-lg shadow-lg shadow-emerald-900/30">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Status content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">
                  {agentExecuting ? 'Agent Active' : 'Agent Complete'}
                </span>
              </div>
              <p className="text-sm text-dark-300">
                {agentStatus || 'Processing your request...'}
              </p>
            </div>

            {/* Tool counter */}
            {toolResults.length > 0 && (
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700/50 rounded-lg">
                <StatusIcon className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-medium text-dark-300">
                  {toolResults.length} {toolResults.length === 1 ? 'tool' : 'tools'} used
                </span>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          {agentExecuting && (
            <div className="mt-3 h-1 bg-dark-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full animate-shimmer"
                   style={{ 
                     width: '60%',
                     backgroundSize: '200% 100%'
                   }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentStatus;