import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  BookOpen, 
  Calendar, 
  Briefcase, 
  TrendingUp
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    attendancePercentage: 0,
    pendingAssignments: 0,
    upcomingEvents: 0,
    activePlacements: 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [activeDrives, setActiveDrives] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentDashboardData = async () => {
      try {
        const [attRes, assignRes, placeRes, eventRes, deptRes] = await Promise.allSettled([
          axios.get('/attendance/student'),
          axios.get('/assignments'),
          axios.get('/placements'),
          axios.get('/events'),
          axios.get('/admin/departments'),
        ]);

        // 1. Real Attendance Percentage from MongoDB
        let liveAttendance = 0;
        if (attRes.status === 'fulfilled' && attRes.value.data?.overallPercentage !== undefined) {
          liveAttendance = attRes.value.data.overallPercentage;
        }

        // 2. Real Assignments from MongoDB
        let liveAssignments: any[] = [];
        if (assignRes.status === 'fulfilled' && assignRes.value.data?.assignments) {
          liveAssignments = assignRes.value.data.assignments;
        }

        // 3. Real Placement Drives from MongoDB
        let livePlacements: any[] = [];
        if (placeRes.status === 'fulfilled' && placeRes.value.data?.placements) {
          livePlacements = placeRes.value.data.placements;
        }

        // 4. Real Events Count from MongoDB
        let liveEventCount = 0;
        if (eventRes.status === 'fulfilled' && eventRes.value.data?.events) {
          liveEventCount = eventRes.value.data.events.length || 0;
        }

        // 5. Real Department Active Courses from MongoDB
        let liveCourses: any[] = [];
        if (deptRes.status === 'fulfilled' && deptRes.value.data?.departments) {
          const userDept = deptRes.value.data.departments.find(
            (d: any) => d.name === (user?.department || 'Computer Science')
          ) || deptRes.value.data.departments[0];

          if (userDept && userDept.activeCourses) {
            liveCourses = userDept.activeCourses;
          }
        }

        setRecentAssignments(liveAssignments);
        setActiveDrives(livePlacements);
        setUpcomingClasses(liveCourses);

        setMetrics({
          attendancePercentage: liveAttendance,
          pendingAssignments: liveAssignments.length,
          activePlacements: livePlacements.length,
          upcomingEvents: liveEventCount,
        });
      } catch (err) {
        console.error('Error loading database data for student dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading live data directly from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header - Read from logged in User MongoDB Object */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">Student Workspace</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/20">
              Semester {user?.studentDetails?.currentSemester || 1}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Roll Number:{' '}
            <span className="font-mono text-slate-200">
              {user?.studentDetails?.rollNumber || 'Unassigned'}
            </span>{' '}
            • Department:{' '}
            <span className="text-slate-200">{user?.department || 'General'}</span>
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
          <div className="micro-label text-slate-500 font-bold uppercase">Database Aggregate Attendance</div>
          <div className="text-lg font-mono font-bold text-emerald-400">
            {metrics.attendancePercentage}%
          </div>
        </div>
      </div>

      {/* Metrics Row - All Calculated from MongoDB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{metrics.pendingAssignments}</div>
            <div className="text-xs text-slate-400">Active Assignments</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-400">{metrics.attendancePercentage}%</div>
            <div className="text-xs text-slate-400">Overall Attendance</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{metrics.upcomingEvents}</div>
            <div className="text-xs text-slate-400">Upcoming Events</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{metrics.activePlacements}</div>
            <div className="text-xs text-slate-400">Active Placement Drives</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses & Timetable from Department Documents */}
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-semibold text-white text-sm">Registered Department Courses</h2>
                <p className="text-xs text-slate-400">Active subjects configured in database</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                {upcomingClasses.length} Active Courses
              </span>
            </div>

            {upcomingClasses.length > 0 ? (
              <div className="space-y-3">
                {upcomingClasses.map((cls, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{cls.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{cls.code || 'CS-101'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Instructor: <strong className="text-slate-300">{cls.instructor || 'Department Faculty'}</strong></p>
                    </div>
                    <div className="text-right font-mono text-xs text-blue-400 font-semibold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      Credits: {cls.credits || 4}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No active courses configured for this department in MongoDB.
              </div>
            )}
          </div>

          {/* Active Assignments from MongoDB Collection */}
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-semibold text-white text-sm">Active Assignments</h2>
                <p className="text-xs text-slate-400">Coursework records from database</p>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
                {recentAssignments.length} Pending
              </span>
            </div>

            {recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {recentAssignments.map((a) => (
                  <div key={a._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-white">{a.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{a.subject || 'General'} • Total Marks: {a.totalMarks || 100}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full font-mono">
                        DUE: {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No active assignments published in MongoDB for your department yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real Placement Drives from MongoDB */}
        <div className="space-y-6">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-semibold text-white text-sm">Placement Drives</h2>
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>

            {activeDrives.length > 0 ? (
              <div className="space-y-3">
                {activeDrives.map((p) => (
                  <div key={p._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{p.companyName}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {p.ctc || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.jobRole}</p>
                    <p className="text-[10px] font-mono text-slate-500">Min CGPA Cutoff: {p.eligibilityCGPA || 'None'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No recruitment drives created in database yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};