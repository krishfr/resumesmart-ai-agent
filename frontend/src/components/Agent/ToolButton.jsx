// frontend/src/components/Agent/ToolButton.jsx
import React, { useState } from 'react';
import { Loader, ArrowRight } from 'lucide-react';

const ToolButton = ({ icon: Icon, label, description, onClick, disabled, executing }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled || executing}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative w-full text-left overflow-hidden
        rounded-xl p-4 transition-all duration-300
        ${disabled
          ? 'bg-dark-800/30 border border-dark-800/50 cursor-not-allowed opacity-50'
          : 'bg-dark-800/50 border border-dark-700/50 hover:border-primary-500/30 hover:bg-dark-800/70 backdrop-blur-sm'
        }
      `}
    >
      {/* Hover glow */}
      {!disabled && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 p-3 rounded-lg transition-all duration-300
          ${disabled 
            ? 'bg-dark-800/50 text-dark-600' 
            : executing
            ? 'bg-primary-500/20 text-primary-400'
            : 'bg-dark-700/50 text-primary-500 group-hover:bg-primary-500/10 group-hover:scale-110'
          }
        `}>
          {executing ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${disabled ? 'text-dark-600' : 'text-white'}`}>
              {label}
            </h3>
            {executing && (
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
          {description && (
            <p className={`text-xs ${disabled ? 'text-dark-600' : 'text-dark-400'}`}>
              {description}
            </p>
          )}
        </div>

        {/* Arrow indicator */}
        {!disabled && !executing && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4 text-primary-500" />
          </div>
        )}
      </div>
    </button>
  );
};

export default ToolButton;