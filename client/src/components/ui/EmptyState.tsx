import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="stitch-card p-12 bg-slate-900 border-slate-800 text-center space-y-3 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
        <FolderOpen className="w-6 h-6" />
      </div>
      <div className="max-w-xs space-y-1">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};