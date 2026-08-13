import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  Settings, 
  LogOut,
  FileCheck,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuthStore();

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'Academics & Attendance', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileCheck },
    { id: 'notices', label: 'Notices & Materials', icon: FileText },
    { id: 'placements', label: 'Placement Drives', icon: Briefcase },
    { id: 'events', label: 'Campus Events', icon: Calendar },
    { id: 'complaints', label: 'Grievance Portal', icon: AlertCircle },
    { id: 'ai-workspace', label: 'CampusGPT Copilot', icon: Sparkles },
    { id: 'agents', label: 'Agent Marketplace', icon: Users },
    { id: 'settings', label: 'Profile & Settings', icon: Settings }, 
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Central Command', icon: LayoutDashboard },
    { id: 'students', label: 'Student Registry', icon: Users },
    { id: 'faculty', label: 'Faculty Registry', icon: UserCheck },
    { id: 'academics', label: 'Academic Structure', icon: BookOpen },
    { id: 'placements', label: 'Placement Drives', icon: Briefcase },
    { id: 'ai-analytics', label: 'AI Platform Metrics', icon: Sparkles },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const facultyNav = [
    { id: 'dashboard', label: 'Faculty Command', icon: LayoutDashboard },
    { id: 'academics', label: 'Course Catalog', icon: BookOpen },
    { id: 'attendance', label: 'Take Attendance', icon: Calendar },
    { id: 'assignments', label: 'Grade Assignments', icon: FileCheck },
    { id: 'notices', label: 'Notices & Study Materials', icon: FileText },
    { id: 'ai-workspace', label: 'CampusGPT AI', icon: Sparkles },
  ];

  const navItems =
    user?.role === 'admin'
      ? adminNav
      : user?.role === 'faculty'
      ? facultyNav
      : studentNav;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">CampusGPT</div>
            <div className="micro-label text-blue-400">UNIVERSITY OS</div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="micro-label px-3 text-slate-500 uppercase tracking-wider">
            {user?.role?.toUpperCase()} ECOSYSTEM
          </span>

          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
