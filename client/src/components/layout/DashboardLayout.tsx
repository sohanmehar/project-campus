import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentTab, setCurrentTab }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenCommandPalette={() => setIsCommandOpen(true)} />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={(path) => {
          if (path.includes('placements')) setCurrentTab('placements');
          if (path.includes('events')) setCurrentTab('events');
          if (path.includes('ai')) setCurrentTab('ai-workspace');
        }}
      />
    </div>
  );
};