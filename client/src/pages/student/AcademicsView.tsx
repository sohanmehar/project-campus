import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle2, AlertTriangle, BarChart2 } from 'lucide-react';

export const AcademicsView: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [overallPercentage, setOverallPercentage] = useState(100);
  const [subjectAnalytics, setSubjectAnalytics] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealAttendance = async () => {
      try {
        const res = await axios.get('/attendance/student');
        if (res.data) {
          setOverallPercentage(res.data.overallPercentage || 100);
          setSubjectAnalytics(res.data.subjectAnalytics || []);
          setAttendanceHistory(res.data.logs || []);
        }
      } catch (err) {
        console.error('Error fetching student attendance', err);
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

  const isEligible = overallPercentage >= 75;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Progress</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Academics & Attendance Analytics</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-right">
            <div className="micro-label text-slate-500">AGGREGATE SCORE</div>
            <div className={`text-lg font-mono font-bold ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Status Banner */}
      <div
        className={`stitch-card p-4 flex items-center justify-between ${
          isEligible
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-rose-500/10 border-rose-500/20'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isEligible ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <h3 className={`text-xs font-bold ${isEligible ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isEligible ? 'Attendance Standard Satisfied' : 'Attendance Warning'}
            </h3>
            <p className={`text-[11px] ${isEligible ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
              Your aggregate attendance ({overallPercentage}%) is {isEligible ? 'above' : 'below'} the mandatory 75% university criteria.
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full border ${
            isEligible
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          {isEligible ? 'ELIGIBLE FOR EXAMS' : 'INELIGIBLE - ACTION REQUIRED'}
        </span>
      </div>

      {/* Subject-Wise Analytics Table */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Subject-wise Attendance Breakdown</h2>
            <p className="text-xs text-slate-400">Live attendance percentage per course</p>
          </div>
          <BarChart2 className="w-4 h-4 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectAnalytics.map((sub, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{sub.code}</span>
                  <h3 className="font-bold text-white text-xs mt-0.5">{sub.subject}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-full border ${
                    sub.percentage >= 75
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
                      sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Attended: {sub.attended} / {sub.total} Sessions</span>
                  <span className={sub.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                    Status: {sub.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Recent Attendance Log</h2>
            <p className="text-xs text-slate-400">Recorded sessions from MongoDB Atlas</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {attendanceHistory.length} Sessions Logged
          </span>
        </div>

        {attendanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {attendanceHistory.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{log.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{log.subject}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{log.slot}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.facultyName}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border font-mono ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No attendance sessions have been logged by faculty for your account yet.
          </div>
        )}
      </div>
    </div>
  );
};