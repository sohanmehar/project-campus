import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Briefcase, Calendar, Sparkles, User, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search courses, assignments, placements, or ask CampusGPT... (Ctrl+K)"
            className="w-full py-4 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="px-2 py-1 text-[10px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">ESC</kbd>
        </div>

        {/* Quick Suggestions List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-3">
          <div>
            <span className="micro-label text-slate-500 px-2">Navigation Shortcuts</span>
            <div className="mt-1 space-y-1">
              <button
                onClick={() => handleSelect('/dashboard')}
                className="w-full flex items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
              >
                <BookOpen className="w-4 h-4 mr-3 text-blue-400" />
                <span>Dashboard & Academics</span>
              </button>

              <button
                onClick={() => handleSelect('/placements')}
                className="w-full flex items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
              >
                <Briefcase className="w-4 h-4 mr-3 text-emerald-400" />
                <span>Placement Drives & Eligibility</span>
              </button>

              <button
                onClick={() => handleSelect('/events')}
                className="w-full flex items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
              >
                <Calendar className="w-4 h-4 mr-3 text-amber-400" />
                <span>Campus Events & Clubs</span>
              </button>

              <button
                onClick={() => handleSelect('/ai-workspace')}
                className="w-full flex items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
              >
                <Sparkles className="w-4 h-4 mr-3 text-indigo-400" />
                <span>Ask CampusGPT Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};