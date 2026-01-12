import React from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ChatInterface from './components/Chat/ChatInterface';
import ResumeUploader from './components/Resume/ResumeUploader';
import AgentControls from './components/Agent/AgentControls';
import useChatStore from './store/chatStore';
import './index.css';

function App() {
  const { resume, activeView } = useChatStore();

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatInterface />;

      case 'resume':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-xl w-full">
              <ResumeUploader />
            </div>
          </div>
        );

      case 'agent':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-xl w-full">
              <AgentControls />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center text-dark-400">
            Settings coming soon
          </div>
        );

      case 'analytics':
        return (
          <div className="flex-1 flex items-center justify-center text-dark-400">
            Analytics coming soon
          </div>
        );

      default:
        return <ChatInterface />;
    }
  };

  const renderRightPanel = () => {
    if (activeView !== 'chat') return null;

    return (
      <aside className="relative w-96 glass-panel border-l border-dark-800/50 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!resume ? (
            <>
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-2">
                  Getting Started
                </h2>
                <p className="text-sm text-dark-500 leading-relaxed">
                  Upload your resume to begin your AI-powered career journey
                </p>
              </div>
              <ResumeUploader />
            </>
          ) : (
            <>
              <AgentControls />

              <div className="card bg-dark-800/30 border-dark-700/30">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Quick Tips
                </h4>
                <div className="space-y-2 text-xs text-dark-400">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary-500 mt-1.5" />
                    <p>Ask specific questions about your experience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary-500 mt-1.5" />
                    <p>Use agent tools for complex tasks</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary-500 mt-1.5" />
                    <p>Responses are powered by local AI</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex overflow-hidden relative">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/3 rounded-full blur-3xl" />
          </div>

          <div className="relative flex-1 flex flex-col">
            {renderMainContent()}
          </div>

          {renderRightPanel()}
        </main>
      </div>
    </div>
  );
}

export default App;
