import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  BookOpen, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  ExternalLink,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    attendancePercentage: 0,
    pendingAssignments: 0,
    upcomingEvents: 0,
    activePlacements: 0,
    totalNotices: 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [activeDrives, setActiveDrives] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentDashboardData = async () => {
      try {
        const [attRes, assignRes, placeRes, eventRes, deptRes, noticeRes] = await Promise.allSettled([
          axios.get('/attendance/student'),
          axios.get('/assignments'),
          axios.get('/placements'),
          axios.get('/events'),
          axios.get('/admin/departments'),
          axios.get('/faculty/notices'),
        ]);

        // 1. Real Attendance Percentage from MongoDB
        let liveAttendance = 0.0;
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
            (d: any) => d.name === (user?.department || 'Computer Science') || d.code === 'CSE'
          ) || deptRes.value.data.departments[0];

          if (userDept && userDept.activeCourses) {
            liveCourses = userDept.activeCourses;
          }
        }

        // 6. Real Notices from Faculty in MongoDB
        let liveNotices: any[] = [];
        if (noticeRes.status === 'fulfilled' && noticeRes.value.data?.notices) {
          liveNotices = noticeRes.value.data.notices;
        }

        setRecentAssignments(liveAssignments);
        setActiveDrives(livePlacements);
        setUpcomingClasses(liveCourses);
        setLatestNotices(liveNotices);

        setMetrics({
          attendancePercentage: liveAttendance,
          pendingAssignments: liveAssignments.length,
          activePlacements: livePlacements.length,
          upcomingEvents: liveEventCount,
          totalNotices: liveNotices.length,
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
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading live data directly from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Welcome Header - Read from logged in User MongoDB Object */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">Student Workspace</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/20">
              Semester {user?.studentDetails?.semester || user?.studentDetails?.currentSemester || 4}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Welcome back, {user?.name || 'Alex Mercer'}!
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Roll Number:{' '}
            <span className="font-mono text-slate-200">
              {user?.studentDetails?.rollNumber || 'CS-2024-042'}
            </span>{' '}
            • Department:{' '}
            <span className="text-slate-200">{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
          <div className="micro-label text-slate-500 font-bold uppercase">Aggregate Attendance</div>
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
                <p className="text-xs text-slate-400">Active curriculum subjects from database catalog</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                {upcomingClasses.length} Active Courses
              </span>
            </div>

            {upcomingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingClasses.slice(0, 6).map((cls, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{cls.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span className="font-mono text-blue-400">{cls.code || 'CS-101'}</span>
                        <span>•</span>
                        <span>{cls.instructor || 'Dr. Sarah Jenkins'}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {cls.credits || 4} Cr
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
                <p className="text-xs text-slate-400">Pending coursework published by faculty</p>
              </div>
              <Link
                to="/assignments"
                className="text-xs font-mono text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>View All ({recentAssignments.length})</span>
              </Link>
            </div>

            {recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {recentAssignments.slice(0, 4).map((a) => (
                  <div key={a._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-white">{a.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{a.subject || 'General'} • Max Marks: {a.totalMarks || 100}</div>
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

        {/* Right Column: Notices & Placement Drives */}
        <div className="space-y-6">
          {/* Department Notices & Circulars (Live from Faculty Posts) */}
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-sm">Faculty Notices</h2>
                  <p className="text-[11px] text-slate-400">Official circulars & study materials</p>
                </div>
              </div>
              <Link
                to="/notices"
                className="text-xs text-blue-400 hover:underline font-mono"
              >
                All ({latestNotices.length})
              </Link>
            </div>

            {latestNotices.length > 0 ? (
              <div className="space-y-3">
                {latestNotices.slice(0, 3).map((notice) => (
                  <div key={notice._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        notice.noticeType === 'study_material'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {notice.noticeType === 'study_material' ? 'STUDY MATERIAL' : 'ANNOUNCEMENT'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{notice.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{notice.content}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 font-mono">
                      <span>By: <strong className="text-slate-300">{notice.facultyName || 'Faculty'}</strong></span>
                      {notice.attachmentUrl && (
                        <a
                          href={notice.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No new notices posted on the department board.
              </div>
            )}
          </div>

          {/* Placement Drives from MongoDB */}
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-semibold text-white text-sm">Placement Drives</h2>
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>

            {activeDrives.length > 0 ? (
              <div className="space-y-3">
                {activeDrives.slice(0, 3).map((p) => (
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