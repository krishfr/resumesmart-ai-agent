// frontend/src/components/Layout/Header.jsx
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-dark-800/50">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl blur-lg opacity-50" />
            {/* Icon container */}
            <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-900/50">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white tracking-tight">
              ResumeSmart
            </h1>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-500/10 border border-primary-500/20 rounded-md">
              <Sparkles className="w-3 h-3 text-primary-400" />
              <span className="text-xs font-medium text-primary-400">AI</span>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700/50 rounded-full">
            <div className="status-indicator bg-emerald-500" />
            <span className="text-xs font-medium text-dark-300">All Systems Operational</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;