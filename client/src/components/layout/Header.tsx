import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search courses, placement drives, or ask AI..."
          className="w-full pl-9 pr-12 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <span className="absolute right-3 top-2.5 px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-400 font-mono rounded">
          Ctrl+K
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Campus Status: Optimal
        </div>

        {/* Real-Time Notification Bell */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 relative transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Card */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                <span className="font-bold text-xs text-white">Campus Notifications</span>
                <span className="text-[10px] text-slate-400 font-mono">{unreadCount} Unread</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                      className={`p-2.5 rounded-xl border text-xs transition cursor-pointer space-y-1 ${
                        n.isRead
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                          : 'bg-blue-600/10 border-blue-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-[11px]">{n.title}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications yet</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};