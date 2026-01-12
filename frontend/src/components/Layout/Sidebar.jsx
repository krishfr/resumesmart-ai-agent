import React from 'react';
import {
  MessageSquare,
  FileText,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';
import useChatStore from '../../store/chatStore';

const Sidebar = () => {
  const {
    resume,
    messages,
    activeView,
    setActiveView
  } = useChatStore();

  const navItems = [
    { icon: MessageSquare, label: 'Chat', view: 'chat', badge: messages.length },
    { icon: FileText, label: 'Resume', view: 'resume' },
    { icon: Zap, label: 'Agent', view: 'agent' },
    { icon: BarChart3, label: 'Analytics', view: 'analytics', soon: true },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-dark-800/50 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 mb-2">
          <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            Workspace
          </h2>
        </div>

        {navItems.map((item, index) => {
          const isActive = activeView === item.view;

          return (
            <button
              key={index}
              onClick={() => {
                if (!item.soon) {
                  setActiveView(item.view);
                }
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-dark-800 text-white shadow-lg shadow-black/10'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                }
                ${item.soon ? 'cursor-not-allowed opacity-60' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary-500/20 text-primary-400 rounded-full">
                  {item.badge}
                </span>
              )}

              {item.soon && (
                <span className="px-2 py-0.5 text-xs font-medium bg-dark-700/50 text-dark-500 rounded-full">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-dark-800 to-transparent my-2" />

      {/* Resume Status */}
      <div className="p-3">
        <div className="relative overflow-hidden bg-gradient-to-br from-dark-800/50 to-dark-900/50 border border-dark-700/50 rounded-xl p-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Resume Status
              </span>
              {resume && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-400">
                    Ready
                  </span>
                </div>
              )}
            </div>

            {resume ? (
              <>
                <p className="text-sm font-medium text-white mb-1 truncate">
                  {resume.filename}
                </p>
                <div className="flex items-center gap-3 text-xs text-dark-500">
                  <span>{messages.length} messages</span>
                  <span>•</span>
                  <span>Active</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-dark-400 mb-2">
                  No resume uploaded
                </p>
                <button
                  onClick={() => setActiveView('resume')}
                  className="w-full px-3 py-1.5 bg-dark-700/50 hover:bg-dark-700 text-dark-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Upload Resume
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-dark-800/50">
        <button
          onClick={() => setActiveView('settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
