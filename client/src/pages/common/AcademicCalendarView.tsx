import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  Filter, 
  ShieldCheck, 
  CalendarDays 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export const AcademicCalendarView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Calendar View & Filter State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(2026, 8, 1)); // Sept 2026 default
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Add Event Modal State (For Coordinators & Admins)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'holiday' | 'exam' | 'event' | 'deadline'>('holiday');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'coordinator' || user?.role === 'admin';

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/calendar');
      if (res.data?.data) {
        setCalendarEvents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching academic calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;
    setSubmitting(true);
    try {
      await axios.post('/calendar', {
        title: title.trim(),
        category,
        startDate,
        description,
      });
      addToast('success', 'Calendar Updated', `'${title}' added to official Academic Calendar.`);
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add calendar item.';
      addToast('error', 'Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete '${eventTitle}' from the Academic Calendar?`)) {
      return;
    }
    try {
      await axios.delete(`/calendar/${id}`);
      addToast('info', 'Calendar Item Removed', `'${eventTitle}' deleted.`);
      setCalendarEvents((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Failed to delete calendar item.');
    }
  };

  // Date Math Helpers
  const viewYear = calendarViewDate.getFullYear();
  const viewMonth = calendarViewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const defaultCalendarEvents = [
    { _id: 'default-1', title: 'Mid-Semester Examinations', category: 'exam', startDate: '2026-09-15', description: 'Institutional mid-term theory and lab evaluations across all departments.' },
    { _id: 'default-2', title: 'Ganesh Chaturthi Holiday', category: 'holiday', startDate: '2026-09-07', description: 'Official campus holiday. Classes and administrative offices closed.' },
    { _id: 'default-3', title: 'Technical Paper Submission Deadline', category: 'deadline', startDate: '2026-09-25', description: 'Final date for 7th Semester Capstone Project Synopsis approval.' },
    { _id: 'default-4', title: 'Annual Hackathon & Tech Fest', category: 'event', startDate: '2026-10-10', description: 'Campus-wide 36-hour hackathon organized by CSI Student Chapter.' },
  ];

  const activeEventsList = calendarEvents.length > 0 ? calendarEvents : defaultCalendarEvents;

  // Map events by YYYY-MM-DD
  const eventsByDateMap = activeEventsList.reduce((acc: Record<string, any[]>, item: any) => {
    if (!item.startDate) return acc;
    const dateStr = new Date(item.startDate).toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  // Build grid items
  const calendarGrid = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarGrid.push({
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateIso: '',
      events: [],
    });
  }

  const todayIso = new Date().toISOString().split('T')[0];
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const dateIso = `${viewYear}-${formattedMonth}-${formattedDay}`;
    const dayEvents = eventsByDateMap[dateIso] || [];

    calendarGrid.push({
      dayNumber: day,
      isCurrentMonth: true,
      dateIso,
      isToday: dateIso === todayIso,
      events: dayEvents,
    });
  }

  const remainingCells = (7 - (calendarGrid.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    calendarGrid.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateIso: '',
      events: [],
    });
  }

  const filteredEvents = selectedCalendarDate
    ? activeEventsList.filter((item: any) => {
        const itemDateIso = new Date(item.startDate).toISOString().split('T')[0];
        return itemDateIso === selectedCalendarDate;
      })
    : activeEventsList;

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading official campus academic calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-amber-400">Institutional Schedule</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            <span>Academic Calendar & Key Milestones</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Calendar Event</span>
            </button>
          )}

          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" />
            <span className="capitalize">{user?.role} Access</span>
          </span>
        </div>
      </div>

      {/* Main Monthly Calendar Card */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-5 rounded-2xl">
        {/* Month Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="micro-label text-slate-400">University Calendar View</span>
            <h2 className="font-bold text-white text-lg mt-0.5">
              {monthNames[viewMonth]} {viewYear}
            </h2>
          </div>

          {/* Category Legend & Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden md:flex items-center space-x-3 text-[11px] font-medium text-slate-400 border-r border-slate-800 pr-3">
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /><span>Holiday</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /><span>Exam</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /><span>Deadline</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /><span>Event</span></span>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth - 1, 1))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(new Date());
                  setSelectedCalendarDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth + 1, 1))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center border-b border-slate-800 pb-2">
            {daysOfWeek.map((d, idx) => (
              <div key={d} className={`text-xs font-bold ${idx === 0 || idx === 6 ? 'text-amber-400/80' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarGrid.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[72px] sm:min-h-[92px] p-1.5 bg-slate-950/30 border border-slate-900/60 rounded-xl text-slate-600 text-xs font-mono select-none"
                  >
                    {cell.dayNumber}
                  </div>
                );
              }

              const isSelected = selectedCalendarDate === cell.dateIso;
              const hasEvents = cell.events.length > 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCalendarDate(isSelected ? null : cell.dateIso)}
                  className={`min-h-[72px] sm:min-h-[92px] p-1.5 text-left rounded-xl border transition-all duration-150 relative flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : cell.isToday
                      ? 'bg-slate-900 border-blue-500/60'
                      : hasEvents
                      ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold ${
                        cell.isToday
                          ? 'w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px]'
                          : isSelected
                          ? 'text-blue-400'
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isToday && (
                      <span className="text-[9px] font-mono text-blue-400 font-semibold uppercase hidden sm:inline">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Event Chips / Dots */}
                  {hasEvents && (
                    <div className="space-y-1 w-full mt-1">
                      {cell.events.map((ev: any, evIdx: number) => {
                        const catColor =
                          ev.category === 'holiday'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : ev.category === 'exam'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : ev.category === 'deadline'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                        return (
                          <div
                            key={ev._id || evIdx}
                            className={`hidden sm:block truncate text-[10px] px-1.5 py-0.5 rounded border font-medium ${catColor}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}

                      {/* Mobile Dot Indicator */}
                      <div className="flex sm:hidden items-center space-x-1 pt-1">
                        {cell.events.map((ev: any, evIdx: number) => (
                          <span
                            key={ev._id || evIdx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              ev.category === 'holiday'
                                ? 'bg-rose-500'
                                : ev.category === 'exam'
                                ? 'bg-amber-500'
                                : ev.category === 'deadline'
                                ? 'bg-blue-500'
                                : 'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Milestones Roster Section */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white text-sm">
              {selectedCalendarDate ? `Events for ${selectedCalendarDate}` : 'Official Academic Schedule & Milestones'}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedCalendarDate
                ? 'Filtered event details for the selected calendar date'
                : 'Upcoming exams, university holidays, submission deadlines, and campus events'}
            </p>
          </div>

          {selectedCalendarDate ? (
            <button
              type="button"
              onClick={() => setSelectedCalendarDate(null)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Filter className="w-3 h-3 text-blue-400" />
              <span>Show All Events</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {filteredEvents.length} Schedule Items
            </span>
          )}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredEvents.map((item: any, idx: number) => (
              <div
                key={item._id || idx}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs relative group"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full uppercase border ${
                    item.category === 'holiday'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : item.category === 'exam'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : item.category === 'deadline'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {item.category}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.startDate).toLocaleDateString()}
                    </span>

                    {canManage && item._id && !item._id.startsWith('default-') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(item._id, item.title)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition cursor-pointer"
                        title="Delete Calendar Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            No events or exams scheduled for this selected date.
          </div>
        )}
      </div>

      {/* Add Calendar Item Modal (Coordinator / Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                <span>Add Academic Calendar Item</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End Semester Theory Examinations"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam Schedule</option>
                    <option value="deadline">Submission Deadline</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about exams, holiday rules, or submission requirements..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Saving Item...' : 'Post to Official Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
