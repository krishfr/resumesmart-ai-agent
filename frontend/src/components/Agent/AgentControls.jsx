// frontend/src/components/Agent/AgentControls.jsx
import React from 'react';
import { Briefcase, Mail, TrendingUp, Sparkles } from 'lucide-react';
import ToolButton from './ToolButton';
import useChatStore from '../../store/chatStore';
import useAgent from '../../hooks/useAgent';

const AgentControls = () => {
  const { resume, agentExecuting } = useChatStore();
  const { executeTask } = useAgent();

  const tools = [
    {
      icon: Briefcase,
      label: 'Find Jobs',
      description: 'Search for roles matching your profile',
      task: 'Find relevant job opportunities for my profile',
    },
    {
      icon: Mail,
      label: 'Cover Letter',
      description: 'Generate tailored application letters',
      task: 'Help me write a cover letter for a software developer position',
    },
    {
      icon: TrendingUp,
      label: 'Skill Analysis',
      description: 'Identify gaps for target roles',
      task: 'Analyze my skill gaps for a senior software engineer role',
    },
  ];

  const handleToolClick = (task) => {
    executeTask(task, true);
  };

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-dark-800/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Agent Tools</h3>
          </div>
          <p className="text-xs text-dark-500">AI-powered career assistance</p>
        </div>
        {resume && (
          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="text-xs font-medium text-emerald-400">Ready</span>
          </div>
        )}
      </div>

      {/* Tools grid */}
      <div className="space-y-3">
        {tools.map((tool, index) => (
          <ToolButton
            key={index}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            onClick={() => handleToolClick(tool.task)}
            disabled={!resume || agentExecuting}
            executing={agentExecuting}
          />
        ))}
      </div>

      {/* Info message */}
      {!resume && (
        <div className="mt-4 pt-4 border-t border-dark-800/50">
          <div className="flex items-start gap-2 text-dark-500 text-xs">
            <div className="w-1 h-1 rounded-full bg-dark-600 mt-1.5 flex-shrink-0" />
            <p className="leading-relaxed">
              Upload your resume to unlock AI agent tools and get personalized career assistance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentControls;