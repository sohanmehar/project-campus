import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface TopBarProps {
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  useAuthStore();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Quick Search Bar Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center space-x-3 px-3.5 py-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-slate-400 text-xs w-full max-w-md transition text-left"
      >
        <Search className="w-4 h-4 text-slate-500" />
        <span className="flex-1 truncate">Search courses, placement drives, or ask AI...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
          Ctrl+K
        </kbd>
      </button>

      {/* Right Utility Badges */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Campus Status: Optimal</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};