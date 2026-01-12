// frontend/src/components/Resume/ResumePreview.jsx
import React from 'react';
import { FileText, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import useChatStore from '../../store/chatStore';

const ResumePreview = () => {
  const { resume } = useChatStore();

  if (!resume) return null;

  return (
    <div className="card-hover animate-scale-in">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-20" />
          <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg shadow-primary-900/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white truncate">{resume.filename}</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Just now</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dark-600" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-primary-400">AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;