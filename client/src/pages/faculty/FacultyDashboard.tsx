import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const classAttendanceData = [
  { subject: 'Database Systems', attendance: 88 },
  { subject: 'Operating Systems', attendance: 92 },
  { subject: 'Algorithms', attendance: 84 },
  { subject: 'Object Oriented Prog.', attendance: 90 },
];

export const FacultyDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/faculty/dashboard');
        setMetrics(response.data.metrics);
        
        setRecentSubmissions([
          {
            id: 'sub-1',
            studentName: 'Alex Mercer',
            rollNumber: 'CS-2024-042',
            assignmentTitle: 'SQL Database Indexing & B-Trees',
            submittedAt: 'Today, 10:15 AM',
            status: 'submitted',
          },
          {
            id: 'sub-2',
            studentName: 'Sohan Mehar',
            rollNumber: '31248',
            assignmentTitle: 'Operating System Semaphore Deadlocks',
            submittedAt: 'Yesterday, 4:30 PM',
            status: 'graded',
            marks: '95/100',
          },
          {
            id: 'sub-3',
            studentName: 'Suchu',
            rollNumber: 'CS-2024-089',
            assignmentTitle: 'Neural Network Forward Propagation',
            submittedAt: 'Yesterday, 2:10 PM',
            status: 'submitted',
          },
        ]);
      } catch (err) {
        console.error('Error loading faculty dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading professor command analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Faculty Ecosystem</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Professor Control Dashboard</h1>
        </div>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full flex items-center">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active Teaching Roster
        </div>
      </div>

      {/* Top PS Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Enrolled Student Count</span>
          <div className="text-2xl font-bold text-white">{metrics?.totalStudents || 120}</div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Department: {metrics?.department || 'Computer Science'}
          </span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Assigned Classes & Subjects</span>
          <div className="text-2xl font-bold text-white">4 Modules</div>
          <span className="text-[11px] text-blue-400 font-semibold">Active Semester Lectures</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Pending Student Submissions</span>
          <div className="text-2xl font-bold text-amber-400">{metrics?.pendingSubmissions || 2}</div>
          <span className="text-[11px] text-amber-400 font-semibold">Requires Faculty Review</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Attendance Sessions Conducted</span>
          <div className="text-2xl font-bold text-white">{metrics?.totalAttendanceSessions || 14}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Synced to Database</span>
        </div>
      </div>

      {/* Assigned Classes Roster & Class Attendance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Roster */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Assigned Classes & Lecture Slots</h2>
              <p className="text-xs text-slate-400">Your active teaching schedule for this semester</p>
            </div>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Database Systems & SQL (CS-401)</div>
                <div className="text-[10px] text-slate-400">Sem 4 • Mon/Wed 10:00 AM - 11:00 AM</div>
              </div>
              <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full">
                120 Students
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Operating Systems (CS-403)</div>
                <div className="text-[10px] text-slate-400">Sem 4 • Tue/Thu 11:15 AM - 12:15 PM</div>
              </div>
              <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full">
                118 Students
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Advanced Algorithms (CS-405)</div>
                <div className="text-[10px] text-slate-400">Sem 6 • Mon/Fri 2:00 PM - 3:30 PM</div>
              </div>
              <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full">
                94 Students
              </span>
            </div>
          </div>
        </div>

        {/* Subject Attendance Performance Analytics Chart */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Subject-wise Attendance Analytics (%)</h2>
              <p className="text-xs text-slate-400">Average student participation per subject</p>
            </div>
          </div>

          <div className="h-52 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendanceData}>
                <XAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Recent Student Submissions Feed</h2>
            <p className="text-xs text-slate-400">Latest student assignment uploads requiring evaluation</p>
          </div>
          <span className="micro-label text-blue-400">Live Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Assignment Title</th>
                <th className="py-2.5 px-3">Submitted Time</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {recentSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>{sub.studentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-normal">{sub.rollNumber}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{sub.assignmentTitle}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{sub.submittedAt}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      sub.status === 'graded' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {sub.status === 'graded' ? `GRADED (${sub.marks})` : 'SUBMITTED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};