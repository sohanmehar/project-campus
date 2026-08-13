import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShieldCheck, Activity, Award, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const attendanceAnalytics = [
  { month: 'Jan', attendance: 89 },
  { month: 'Feb', attendance: 92 },
  { month: 'Mar', attendance: 86 },
  { month: 'Apr', attendance: 88 },
  { month: 'May', attendance: 91 },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/admin/stats');
        setStats(response.data.stats);
      } catch (err) {
        console.error('Error fetching admin command data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading university central command overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">System Administration</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Central Command Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Super Admin Mode
          </span>
        </div>
      </div>

      {/* Enterprise Stat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Total Enrolled Students</span>
          <div className="text-2xl font-bold text-white">{stats?.totalStudents?.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +2.4% this semester
          </span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Active Faculty Roster</span>
          <div className="text-2xl font-bold text-white">{stats?.totalFaculty}</div>
          <span className="text-[11px] text-slate-400">Across 12 Departments</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Average Attendance</span>
          <div className="text-2xl font-bold text-white">{stats?.avgAttendance}%</div>
          <span className="text-[11px] text-blue-400 font-semibold">Campus Aggregate</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Placement Rate</span>
          <div className="text-2xl font-bold text-white">{stats?.placementRate}%</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Batch 2026</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Monthly Attendance Trends (%)</h2>
              <p className="text-xs text-slate-400">Institutional average across all faculties</p>
            </div>
          </div>
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceAnalytics}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity & Audit Logs */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Real-time System Audit Logs</h2>
              <p className="text-xs text-slate-400">Administrative activity & security events</p>
            </div>
            <span className="micro-label text-emerald-400">Live</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Placement Drive Created</div>
                <div className="text-[10px] text-slate-400">Posted Amazon SDE Drive (24 LPA)</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">2 mins ago</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Faculty Member Onboarded</div>
                <div className="text-[10px] text-slate-400">Added Dr. Jane Doe to Computer Science</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">14 mins ago</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">System Settings Updated</div>
                <div className="text-[10px] text-slate-400">Mandatory Attendance threshold set to 75%</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};