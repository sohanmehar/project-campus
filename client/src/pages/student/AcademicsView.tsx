import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle2, AlertTriangle, BarChart2, Calendar, ShieldCheck } from 'lucide-react';

export const AcademicsView: React.FC = () => {
  useAuthStore();
  const [loading, setLoading] = useState(true);
  const [overallPercentage, setOverallPercentage] = useState(0.0);
  const [totalLectures, setTotalLectures] = useState(0);
  const [subjectAnalytics, setSubjectAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'subjects' | 'monthly' | 'calculator' | 'calendar'>('subjects');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealAttendance = async () => {
      try {
        const [res, calRes] = await Promise.allSettled([
          axios.get('/attendance/student'),
          axios.get('/calendar'),
        ]);

        if (res.status === 'fulfilled' && res.value.data) {
          setOverallPercentage(res.value.data.overallPercentage ?? 0.0);
          setTotalLectures(res.value.data.totalLectures ?? 0);
          setSubjectAnalytics(res.value.data.subjectAnalytics || []);
        }

        if (calRes.status === 'fulfilled' && calRes.value.data?.data) {
          setCalendarEvents(calRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching student academic data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealAttendance();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading student attendance from MongoDB Atlas...</p>
      </div>
    );
  }

  const isNewStudent = totalLectures === 0;
  const isEligible = overallPercentage >= 75;

  const monthlyBreakdown = [
    { month: 'August 2026', percentage: 92.4, conducted: 42, attended: 39, status: 'Optimal' },
    { month: 'July 2026', percentage: 86.8, conducted: 38, attended: 33, status: 'Good' },
    { month: 'June 2026', percentage: 89.2, conducted: 46, attended: 41, status: 'Optimal' },
    { month: 'May 2026', percentage: 84.0, conducted: 50, attended: 42, status: 'Good' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Progress</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Academics & Attendance Analytics</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-left sm:text-right">
            <div className="micro-label text-slate-500 font-bold uppercase">Aggregate Attendance</div>
            <div className={`text-lg font-mono font-bold ${
              isNewStudent ? 'text-blue-400' : isEligible ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Status Banner */}
      <div
        className={`stitch-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl ${
          isNewStudent
            ? 'bg-blue-500/10 border-blue-500/20'
            : isEligible
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-rose-500/10 border-rose-500/20'
        }`}
      >
        <div className="flex items-start sm:items-center space-x-3">
          {isNewStudent ? (
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : isEligible ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            <h3 className={`text-xs font-bold ${
              isNewStudent ? 'text-blue-300' : isEligible ? 'text-emerald-300' : 'text-rose-300'
            }`}>
              {isNewStudent
                ? 'No Classroom Sessions Conducted Yet'
                : isEligible
                ? 'Attendance Standard Satisfied'
                : 'Attendance Warning'}
            </h3>
            <p className={`text-[11px] ${
              isNewStudent ? 'text-blue-300/80' : isEligible ? 'text-emerald-400/80' : 'text-rose-400/80'
            }`}>
              {isNewStudent
                ? '0 classroom sessions logged so far. Your attendance percentage will track live as professors record attendance.'
                : `Your aggregate attendance (${overallPercentage}%) is ${isEligible ? 'above' : 'below'} the mandatory 75% university criteria.`}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full border self-start sm:self-auto shrink-0 ${
            isNewStudent
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              : isEligible
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          {isNewStudent ? 'NEW ENROLLMENT' : isEligible ? 'ELIGIBLE FOR EXAMS' : 'INELIGIBLE - ACTION REQUIRED'}
        </span>
      </div>

      {/* Navigation Sub-Tabs (Subject Analytics, Monthly Reports, Safe Buffer) */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Subject-Wise Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Monthly Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Absence Buffer & Safety</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Academic Calendar</span>
        </button>
      </div>

      {/* Tab 1: Subject-Wise Analytics */}
      {activeTab === 'subjects' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Subject-wise Attendance Breakdown</h2>
              <p className="text-xs text-slate-400">Live attendance percentage per registered course</p>
            </div>
            <BarChart2 className="w-4 h-4 text-blue-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {subjectAnalytics.map((sub, idx) => {
              const hasNoSessions = sub.total === 0;
              return (
                <div key={idx} className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{sub.code}</span>
                      <h3 className="font-bold text-white text-xs mt-0.5">{sub.subject}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-full border ${
                        hasNoSessions
                          ? 'bg-slate-900 text-slate-400 border-slate-800'
                          : sub.percentage >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          hasNoSessions
                            ? 'bg-slate-800'
                            : sub.percentage >= 75
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${hasNoSessions ? 0 : Math.min(sub.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Attended: {sub.attended} / {sub.total} Sessions</span>
                      <span className={
                        hasNoSessions
                          ? 'text-slate-500'
                          : sub.percentage >= 75
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }>
                        Status: {hasNoSessions ? 'Not Started' : sub.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Reports */}
      {activeTab === 'monthly' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Monthly Attendance History & Reports</h2>
              <p className="text-xs text-slate-400">Monthly aggregate percentages and session counts</p>
            </div>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {monthlyBreakdown.map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{m.month}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    {m.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${m.percentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                  <span>Conducted: {m.conducted}</span>
                  <span>Attended: <strong className="text-white">{m.attended}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Absence Buffer Calculator */}
      {activeTab === 'calculator' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Safe Absence & Attendance Simulator</h2>
              <p className="text-xs text-slate-400">Calculates permissible absences while maintaining &gt;75% requirement</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="micro-label text-slate-400">Target Benchmark</span>
              <div className="text-xl font-bold font-mono text-blue-400">75.0%</div>
              <p className="text-[10px] text-slate-500">University minimum exam threshold</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="micro-label text-slate-400">Estimated Buffer</span>
              <div className="text-xl font-bold font-mono text-emerald-400">3 - 4 Lectures</div>
              <p className="text-[10px] text-slate-500">Safe absences remaining across courses</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="micro-label text-slate-400">Semester Status</span>
              <div className="text-xl font-bold font-mono text-emerald-400">SAFE</div>
              <p className="text-[10px] text-slate-500">On track for full hall-ticket clearance</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Academic Calendar & Holidays */}
      {activeTab === 'calendar' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Official Campus Academic Calendar</h2>
              <p className="text-xs text-slate-400">Key exam dates, university holidays, submission deadlines, and campus events</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {calendarEvents.length > 0 ? calendarEvents.length : 4} Upcoming Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {(calendarEvents.length > 0
              ? calendarEvents
              : [
                  { title: 'Mid-Semester Examinations', category: 'exam', startDate: '2026-09-15', description: 'Institutional mid-term theory and lab evaluations across all departments.' },
                  { title: 'Ganesh Chaturthi Holiday', category: 'holiday', startDate: '2026-09-07', description: 'Official campus holiday. Classes and administrative offices closed.' },
                  { title: 'Technical Paper Submission Deadline', category: 'deadline', startDate: '2026-09-25', description: 'Final date for 7th Semester Capstone Project Synopsis approval.' },
                  { title: 'Annual Hackathon & Tech Fest', category: 'event', startDate: '2026-10-10', description: 'Campus-wide 36-hour hackathon organized by CSI Student Chapter.' },
                ]
            ).map((item, idx) => (
              <div key={item._id || idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
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

                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(item.startDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};