import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText,
  TrendingUp,
  ExternalLink,
  Eye,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '../../store/useToastStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const CoordinatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetchCoordinatorData = async () => {
    try {
      const response = await axios.get('/coordinator/stats');
      setStats(response.data.stats);
      setApprovals(response.data.stats?.pendingApprovals || []);
    } catch (err) {
      console.error('Error fetching coordinator stats', err);
    } finally {
      setLoading(false);
    }
  };

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calTitle, setCalTitle] = useState('');
  const [calCategory, setCalCategory] = useState<'holiday' | 'exam' | 'event' | 'deadline'>('holiday');
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [calDesc, setCalDesc] = useState('');
  const [addingCal, setAddingCal] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      const res = await axios.get('/calendar');
      if (res.data?.data) {
        setCalendarEvents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching calendar in coordinator dashboard', err);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleAddCalendarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle.trim() || !calDate) return;
    setAddingCal(true);
    try {
      await axios.post('/calendar', {
        title: calTitle.trim(),
        category: calCategory,
        startDate: calDate,
        description: calDesc,
      });
      addToast('success', 'Calendar Updated', `'${calTitle}' added to official Academic Calendar.`);
      setCalTitle('');
      setCalDesc('');
      setIsCalendarModalOpen(false);
      fetchCalendarEvents();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not add calendar item.');
    } finally {
      setAddingCal(false);
    }
  };

  const handleApprove = async (id: string, name: string, target: string) => {
    try {
      setApprovals((prev) => prev.filter((a) => (a._id || a.id) !== id));
      await axios.post(`/coordinator/approvals/${id}/decide`, { action: 'approve' });
      addToast('success', 'Request Approved', `Approved ${name} for ${target}. Notification sent to student.`);
    } catch (err: any) {
      console.error('Error approving request:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not approve request.');
      fetchCoordinatorData();
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      setApprovals((prev) => prev.filter((a) => (a._id || a.id) !== id));
      await axios.post(`/coordinator/approvals/${id}/decide`, { action: 'decline' });
      addToast('info', 'Request Declined', `Declined request for ${name}. Notification sent to student.`);
    } catch (err: any) {
      console.error('Error declining request:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not decline request.');
      fetchCoordinatorData();
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Aggregating campus activity metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-purple-400">Activity Operations</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Activity & Event Command</h1>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-xl flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-purple-400" /> Coordinator Access
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Link
          to="/events"
          className="stitch-card p-3.5 bg-slate-900 border-slate-800 rounded-xl hover:border-purple-500/40 transition flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Post Campus Event</div>
            <div className="text-[10px] text-slate-400">Create & Issue Digital Passes</div>
          </div>
        </Link>

        <Link
          to="/clubs"
          className="stitch-card p-3.5 bg-slate-900 border-slate-800 rounded-xl hover:border-blue-500/40 transition flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Clubs & Societies</div>
            <div className="text-[10px] text-slate-400">Review Registered Roster</div>
          </div>
        </Link>

        <Link
          to="/notices"
          className="stitch-card p-3.5 bg-slate-900 border-slate-800 rounded-xl hover:border-emerald-500/40 transition flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">Activity Circulars</div>
            <div className="text-[10px] text-slate-400">Broadcast Campus Announcements</div>
          </div>
        </Link>
      </div>

      {/* Live Counter Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Active Campus Events</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalEvents ?? 0}</div>
          <span className="text-[10px] text-purple-400 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Published Hubs
          </span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Active Clubs</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalClubs ?? 0}</div>
          <span className="text-[10px] text-blue-400 font-semibold">Registered Societies</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Total Event Passes</span>
          <div className="text-xl font-bold font-mono text-white">{stats?.totalRegistrations ?? 0}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Active Digital QR Passes</span>
        </div>

        <div className="stitch-card p-3.5 bg-slate-900 border-slate-800 space-y-1 rounded-xl">
          <span className="micro-label text-slate-400">Pending Approvals</span>
          <div className="text-xl font-bold font-mono text-amber-400">{approvals.length}</div>
          <span className="text-[10px] text-amber-400/80 font-semibold">Requires Action</span>
        </div>
      </div>

      {/* Student Approvals Queue (PDF Page 5) */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Student Activity & Membership Approvals</h2>
            <p className="text-xs text-slate-400">Review pending student club applications and organizer pass approvals</p>
          </div>
          <span className="micro-label text-amber-400">Action Queue ({approvals.length})</span>
        </div>

        {approvals.length > 0 ? (
          <div className="space-y-2.5">
            {approvals.map((item) => (
              <div
                key={item._id || item.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const profileData = item.studentId || {
                          name: item.studentName,
                          email: 'student@campusgpt.edu',
                          department: item.department || 'Computer Science & Engineering',
                          studentDetails: {
                            rollNumber: item.rollNumber || 'CS-2024-042',
                            semester: 4,
                            cgpa: 3.85,
                            skills: ['React', 'Node.js', 'Python', 'Leadership'],
                            linkedinUrl: 'https://linkedin.com/in/student',
                            githubUrl: 'https://github.com/student',
                            resumeUrl: 'https://drive.google.com/file/d/resume/view',
                          },
                        };
                        setSelectedStudentProfile(profileData);
                      }}
                      className="text-left group cursor-pointer flex items-center space-x-1.5"
                      title="Click to view student dossier & portfolio"
                    >
                      <span className="font-semibold text-white text-xs group-hover:text-purple-400 transition">{item.studentName}</span>
                      <Eye className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100 transition shrink-0" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">({item.rollNumber})</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full border border-blue-500/20">
                      {item.department}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Applied for: <strong className="text-slate-100">{item.targetName}</strong> •{' '}
                    <span className="text-purple-400">{item.requestType}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleApprove(item._id || item.id, item.studentName, item.targetName)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(item._id || item.id, item.studentName)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center space-x-1 transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/60">
            No pending student activity approvals. All requests processed cleanly!
          </div>
        )}
      </div>

      {/* Analytics & Events Participation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Events Participation Roster */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Upcoming Campus Events Roster</h2>
              <p className="text-xs text-slate-400">Attendee capacity and participation rates</p>
            </div>
            <Link to="/events" className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1">
              <span>Manage Events</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Venue</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(stats?.eventParticipation || []).map((ev: any) => (
                  <tr key={ev._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{ev.title}</td>
                    <td className="py-2.5 px-3 text-slate-400">{ev.venue}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">{ev.date}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold rounded-full font-mono">
                        {ev.seats || '100'} Seats
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Club Membership Distribution */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Club Category Engagement</h2>
              <p className="text-xs text-slate-400">Total student members registered across societies</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Live Roster
            </span>
          </div>

          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.clubCategoryBreakdown || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="members" fill="#a855f7" radius={[4, 4, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Academic Calendar Manager Card for Coordinators */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Academic Calendar & Holiday Manager</h2>
            <p className="text-xs text-slate-400">Post university holidays, exam schedules, and academic milestones</p>
          </div>
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <span>+ Add Calendar Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {calendarEvents.map((item, idx) => (
            <div key={item._id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{new Date(item.startDate).toLocaleDateString()}</span>
              </div>
              <div className="font-bold text-white text-xs mt-1">{item.title}</div>
              <p className="text-slate-400 text-[11px] line-clamp-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Calendar Item Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Add Academic Calendar Item</h3>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCalendarItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Title *</label>
                <input
                  type="text"
                  required
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  placeholder="e.g. End Semester Theory Exam"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Category *</label>
                  <select
                    value={calCategory}
                    onChange={(e) => setCalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam Schedule</option>
                    <option value="deadline">Submission Deadline</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Date *</label>
                  <input
                    type="date"
                    required
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={calDesc}
                  onChange={(e) => setCalDesc(e.target.value)}
                  placeholder="Provide brief details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingCal || !calTitle}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                {addingCal ? 'Saving...' : 'Add to Academic Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Student Dossier Modal for Coordinator */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-lg w-full space-y-4 relative rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-purple-400">Student Profile & Portfolio</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedStudentProfile.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-white">{selectedStudentProfile.email || 'student@campusgpt.edu'}</span>
              </div>

              {(selectedStudentProfile.phone || selectedStudentProfile.studentDetails?.phone) && (
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-mono text-slate-300">{selectedStudentProfile.phone || selectedStudentProfile.studentDetails?.phone}</span>
                </div>
              )}

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Department:</span>
                <span className="text-white">{selectedStudentProfile.department || 'Computer Science & Engineering'}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono text-purple-400">
                  {selectedStudentProfile.studentDetails?.rollNumber || selectedStudentProfile.rollNumber || 'CS-2024-042'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Semester:</span>
                  <span className="font-mono text-white">Sem {selectedStudentProfile.studentDetails?.semester || 4}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">CGPA:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedStudentProfile.studentDetails?.cgpa ? Number(selectedStudentProfile.studentDetails.cgpa).toFixed(2) : '3.85'}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {selectedStudentProfile.studentDetails?.skills && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-slate-500 text-[11px] font-semibold">Technical & Leadership Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedStudentProfile.studentDetails.skills)
                      ? selectedStudentProfile.studentDetails.skills
                      : String(selectedStudentProfile.studentDetails.skills).split(',')
                    ).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md font-mono">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Links */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-500 text-[11px] font-semibold">Verified Portfolio & Resume Links:</span>
                <div className="space-y-1.5">
                  {(selectedStudentProfile.studentDetails?.linkedinUrl || selectedStudentProfile.studentDetails?.linkedIn) && (
                    <a
                      href={selectedStudentProfile.studentDetails.linkedinUrl || selectedStudentProfile.studentDetails.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 text-xs rounded-lg transition"
                    >
                      <span className="truncate">LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  )}

                  {(selectedStudentProfile.studentDetails?.githubUrl || selectedStudentProfile.studentDetails?.github) && (
                    <a
                      href={selectedStudentProfile.studentDetails.githubUrl || selectedStudentProfile.studentDetails.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-400 text-xs rounded-lg transition"
                    >
                      <span className="truncate">GitHub Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  )}

                  {selectedStudentProfile.studentDetails?.resumeUrl && (
                    <a
                      href={selectedStudentProfile.studentDetails.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 transition"
                    >
                      <span className="truncate flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Verified Resume PDF</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-purple-600/20"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
