import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Users, 
  Briefcase, 
  Calendar 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

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

  const deptDistributionData = stats?.deptDistribution && stats.deptDistribution.length > 0 
    ? stats.deptDistribution 
    : [];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">System Administration</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Central Command Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-xl flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" /> Super Admin Access
          </span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Link
          to="/students"
          className="stitch-card p-3 bg-slate-900 border-slate-800 rounded-xl hover:border-blue-500/40 transition flex items-center space-x-2.5 group"
        >
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Student Registry</div>
            <div className="text-[10px] text-slate-400">Enroll & Manage</div>
          </div>
        </Link>

        <Link
          to="/faculty"
          className="stitch-card p-3 bg-slate-900 border-slate-800 rounded-xl hover:border-emerald-500/40 transition flex items-center space-x-2.5 group"
        >
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Faculty Roster</div>
            <div className="text-[10px] text-slate-400">Assign Courses</div>
          </div>
        </Link>

        <Link
          to="/placements"
          className="stitch-card p-3 bg-slate-900 border-slate-800 rounded-xl hover:border-amber-500/40 transition flex items-center space-x-2.5 group"
        >
          <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Placement Hub</div>
            <div className="text-[10px] text-slate-400">Publish Drives</div>
          </div>
        </Link>

        <Link
          to="/events"
          className="stitch-card p-3 bg-slate-900 border-slate-800 rounded-xl hover:border-purple-500/40 transition flex items-center space-x-2.5 group"
        >
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Campus Events</div>
            <div className="text-[10px] text-slate-400">Manage Passes</div>
          </div>
        </Link>
      </div>

      {/* Live Counter Metrics from MongoDB Atlas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Total Students</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalStudents ?? 0}</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Active Roster
          </span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Active Faculty</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalFaculty ?? 0}</div>
          <span className="text-[10px] text-slate-400">Teaching Staff</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Departments</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalDepartments ?? 0}</div>
          <span className="text-[10px] text-blue-400 font-semibold">Active Branches</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Campus Events</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.activeEvents ?? 0}</div>
          <span className="text-[10px] text-purple-400 font-semibold">Published Hubs</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Attendance %</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.avgAttendance ?? 0}%</div>
          <span className="text-[10px] text-blue-400 font-semibold">Live Aggregate</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Placement Rate</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.placementRate ?? 0}%</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Recruitment Ratio</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Trends */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Monthly Attendance Trends (%)</h2>
              <p className="text-xs text-slate-400">Live attendance percentage aggregated from database sessions</p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Live Feed
            </span>
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

        {/* Department Distribution */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Department Enrollment & Strength</h2>
              <p className="text-xs text-slate-400">Student enrollment distribution across active engineering departments</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Department Ratio
            </span>
          </div>
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistributionData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time System Audit Logs (PDF Page 14) */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Real-time System Audit Logs</h2>
            <p className="text-xs text-slate-400">Live operational audit trail captured across user actions</p>
          </div>
          <span className="micro-label text-emerald-400">Live MongoDB Feed</span>
        </div>

        <div className="space-y-2.5 text-xs">
          {stats?.auditLogs && stats.auditLogs.length > 0 ? (
            stats.auditLogs.map((log: any, idx: number) => (
              <div key={log.id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white text-xs">{log.title}</div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">{log.time}</span>
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
  );
};