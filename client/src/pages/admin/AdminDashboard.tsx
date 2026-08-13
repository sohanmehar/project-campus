import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/admin/stats');
        setStats(response.data.stats);
      } catch (err) {
        console.error('Error fetching dynamic admin data', err);
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
        <p className="text-xs text-slate-400 font-mono">Aggregating live MongoDB Atlas analytics...</p>
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
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Super Admin Access
          </span>
        </div>
      </div>

      {/* Live Counter Metrics from MongoDB */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Total Students</span>
          <div className="text-xl font-bold text-white">{stats?.totalStudents ?? 0}</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Active Roster
          </span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Active Faculty</span>
          <div className="text-xl font-bold text-white">{stats?.totalFaculty ?? 0}</div>
          <span className="text-[10px] text-slate-400">Assigned Members</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Departments</span>
          <div className="text-xl font-bold text-white">{stats?.totalDepartments ?? 0}</div>
          <span className="text-[10px] text-blue-400 font-semibold">Active Faculties</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Campus Events</span>
          <div className="text-xl font-bold text-white">{stats?.activeEvents ?? 0}</div>
          <span className="text-[10px] text-purple-400 font-semibold">Published Drives</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Attendance %</span>
          <div className="text-xl font-bold text-white">{stats?.avgAttendance ?? 0}%</div>
          <span className="text-[10px] text-blue-400 font-semibold">Live Aggregate</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1">
          <span className="micro-label text-slate-400">Placement Rate</span>
          <div className="text-xl font-bold text-white">{stats?.placementRate ?? 0}%</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Live Hired Ratio</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Monthly Attendance Trends (%)</h2>
              <p className="text-xs text-slate-400">Live attendance percentage aggregated from database sessions</p>
            </div>
          </div>
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyTrends || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real MongoDB Audit Logs */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Real-time System Audit Logs</h2>
              <p className="text-xs text-slate-400">Live feed generated from actual database records</p>
            </div>
            <span className="micro-label text-emerald-400">Live MongoDB Feed</span>
          </div>

          <div className="space-y-3 text-xs">
            {stats?.auditLogs && stats.auditLogs.length > 0 ? (
              stats.auditLogs.map((log: any, idx: number) => (
                <div key={log.id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{log.title}</div>
                    <div className="text-[10px] text-slate-400">{log.details}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                <span>No recent database logs recorded.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};