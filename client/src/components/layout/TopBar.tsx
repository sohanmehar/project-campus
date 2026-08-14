import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Bell, Menu, CheckCircle2, Briefcase, FileCheck, Calendar, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette, onToggleMobileSidebar }) => {
  useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount ?? res.data.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'placement':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      case 'assignment':
        return <FileCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'attendance':
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'event':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center space-x-2.5 flex-1 max-w-md mr-2">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition shrink-0 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-slate-400 text-xs w-full transition text-left cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="flex-1 truncate">Search courses, drives, clubs, or ask AI...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Utility Badges & Notification Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 relative" ref={notifRef}>
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Campus Status: Optimal</span>
        </div>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Bell Button */}
        <button
          onClick={() => {
            setIsNotifOpen(!isNotifOpen);
            if (!isNotifOpen) fetchNotifications();
          }}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Real-time Notifications Popover */}
        {isNotifOpen && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-xs">Campus Notifications</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {notifications.length} Alerts
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                      n.isRead
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                        : 'bg-slate-950 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 font-bold text-white text-[11px]">
                        {getNotifIcon(n.type)}
                        <span>{n.title}</span>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          className="text-[9px] font-mono text-blue-400 hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                    <div className="text-[9px] font-mono text-slate-500">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No new campus notifications right now.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};