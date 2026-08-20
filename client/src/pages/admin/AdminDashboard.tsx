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
  const [eventAnalytics, setEventAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, eventsRes, complaintsRes] = await Promise.allSettled([
        axios.get('/admin/stats'),
        axios.get('/admin/events-analytics'),
        axios.get('/admin/complaints'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (eventsRes.status === 'fulfilled') setEventAnalytics(eventsRes.value.data.analytics);
      if (complaintsRes.status === 'fulfilled') setComplaints(complaintsRes.value.data.complaints || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateComplaint = async (complaintId: string, newStatus: string) => {
    setResolvingId(complaintId);
    try {
      await axios.patch(`/admin/complaints/${complaintId}`, {
        status: newStatus,
        resolutionNotes: `Resolved & verified by Admin at ${new Date().toLocaleTimeString()}`,
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error updating complaint status', err);
    } finally {
      setResolvingId(null);
    }
  };

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

  const eventChartData = eventAnalytics?.events && eventAnalytics.events.length > 0
    ? eventAnalytics.events
    : [
        { title: 'AI Hackathon', registeredCount: 140, capacity: 150 },
        { title: 'CyberSec Summit', registeredCount: 95, capacity: 120 },
        { title: 'Robotics Expo', registeredCount: 110, capacity: 150 },
        { title: 'Cultural Fest', registeredCount: 220, capacity: 300 },
      ];

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
        {/* Event Participation Charts */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Event Participation & Registrations</h2>
              <p className="text-xs text-slate-400">Student enrollment and capacity utilization per event</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Live Registrations
            </span>
          </div>
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventChartData}>
                <XAxis dataKey="title" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="registeredCount" fill="#a855f7" radius={[4, 4, 0, 0]} name="Registered Students" />
                <Bar dataKey="capacity" fill="#334155" radius={[4, 4, 0, 0]} name="Total Capacity" />
              </BarChart>
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

      {/* Admin Grievances & Complaints Resolution Section */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Student Grievances & Resolution Portal</h2>
            <p className="text-xs text-slate-400">Review incoming student tickets, assign support cells, and log resolution notes</p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {complaints.filter((c) => c.status !== 'Resolved').length} Active Tickets
          </span>
        </div>

        <div className="space-y-3">
          {complaints.length > 0 ? (
            complaints.map((c) => {
              const studentName = c.studentId?.name || 'Student User';
              const ticketCategory = c.category || 'General';
              return (
                <div key={c._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-blue-400 font-bold">{c.ticketId}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold text-[10px] uppercase">
                        {ticketCategory}
                      </span>
                      <span className="text-slate-400 text-[11px]">from <strong>{studentName}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {c.status}
                      </span>

                      {c.status !== 'Resolved' && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUpdateComplaint(c._id, 'In Progress')}
                            disabled={resolvingId === c._id}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/20 cursor-pointer disabled:opacity-50"
                          >
                            In Progress
                          </button>

                          <button
                            onClick={() => handleUpdateComplaint(c._id, 'Resolved')}
                            disabled={resolvingId === c._id}
                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] rounded border border-emerald-500/20 cursor-pointer disabled:opacity-50"
                          >
                            Resolve Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">{c.description}</p>

                  {c.resolutionNotes && (
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                      <strong>Resolution Notes:</strong> {c.resolutionNotes}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">No active student grievances logged in portal.</div>
          )}
        </div>
      </div>
    </div>
  );
};