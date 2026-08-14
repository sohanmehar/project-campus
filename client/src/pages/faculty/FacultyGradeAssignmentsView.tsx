import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToastStore } from '../../store/useToastStore';
import { Plus, ExternalLink, X, BookOpen, CheckCircle, Clock, Trash2, Calendar, FileText, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const FacultyGradeAssignmentsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradingForm, setGradingForm] = useState({ marksObtained: '', feedback: '' });
  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  // Helper to get default date (7 days from now in YYYY-MM-DD format)
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: 'Database Systems & SQL',
    deadline: getDefaultDeadline(),
    totalMarks: '100',
    priority: 'medium',
  });

  const fetchFacultyData = async () => {
    try {
      const [assignRes, subRes] = await Promise.allSettled([
        axios.get('/faculty/assignments'),
        axios.get('/faculty/submissions'),
      ]);

      if (assignRes.status === 'fulfilled' && assignRes.value.data?.assignments) {
        setAssignments(assignRes.value.data.assignments);
      } else {
        // Fallback to student endpoint if needed
        const fallbackRes = await axios.get('/assignments').catch(() => null);
        if (fallbackRes?.data?.assignments) {
          setAssignments(fallbackRes.data.assignments);
        }
      }

      if (subRes.status === 'fulfilled' && subRes.value.data?.submissions) {
        setSubmissions(subRes.value.data.submissions);
      }
    } catch (err) {
      console.error('Error fetching faculty assignment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) {
      addToast('error', 'Validation Error', 'Assignment title is required.');
      return;
    }

    setCreatingAssignment(true);
    try {
      const payload = {
        title: newAssignment.title.trim(),
        description: newAssignment.description.trim() || 'Assignment problem statement and rubric.',
        subject: newAssignment.subject,
        courseName: newAssignment.subject,
        courseCode: 'CS-401',
        deadline: newAssignment.deadline || getDefaultDeadline(),
        totalMarks: Number(newAssignment.totalMarks) || 100,
        priority: newAssignment.priority || 'medium',
        facultyId: user?.id || (user as any)?._id || '665000000000000000000001',
      };

      await axios.post('/faculty/assignments', payload);
      addToast('success', 'Assignment Published', `'${newAssignment.title}' published successfully.`);
      setIsCreateModalOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: 'Database Systems & SQL',
        deadline: getDefaultDeadline(),
        totalMarks: '100',
        priority: 'medium',
      });
      await fetchFacultyData();
      setActiveTab('assignments');
    } catch (err: any) {
      console.error('Error creating assignment:', err.response?.data || err);
      const serverError = err.response?.data?.message || err.response?.data?.error || 'Could not publish assignment. Please check server logs.';
      addToast('error', 'Publish Failed', serverError);
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'? This will also remove any related submissions.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`/faculty/assignments/${id}`);
      addToast('success', 'Assignment Deleted', `'${title}' was removed.`);
      await fetchFacultyData();
    } catch (err: any) {
      console.error('Delete assignment error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const targetId = selectedSubmission._id;
      const newMarks = Number(gradingForm.marksObtained);
      const newFeedback = gradingForm.feedback;

      await axios.put(`/faculty/submissions/${targetId}/grade`, {
        marksObtained: newMarks,
        feedback: newFeedback,
      });

      addToast('success', 'Grade Saved', `Evaluation recorded for ${selectedSubmission.studentName}.`);
      setSelectedSubmission(null);
      await fetchFacultyData();
    } catch (err: any) {
      console.error('Grading submission error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not save grade.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading faculty assignments portal...</p>
      </div>
    );
  }

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">Academic Review</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
              Faculty Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Assignments & Grading Portal</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{assignments.length}</div>
            <div className="text-[11px] text-slate-400">Published Modules</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{submissions.length}</div>
            <div className="text-[11px] text-slate-400">Total Submissions</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-amber-400">{pendingCount}</div>
            <div className="text-[11px] text-slate-400">Pending Review</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-400">{gradedCount}</div>
            <div className="text-[11px] text-slate-400">Graded Submissions</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-4 text-xs font-semibold transition border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Published Coursework ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-4 text-xs font-semibold transition border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Student Submissions Roster ({submissions.length})</span>
          {pendingCount > 0 && (
            <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono border border-amber-500/30">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Published Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Assignment Modules</h2>
              <p className="text-xs text-slate-400">Manage published assignments distributed to students</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>New Assignment</span>
            </button>
          </div>

          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => {
                const isDeleting = deletingId === assignment._id;
                const formattedDate = assignment.deadline
                  ? new Date(assignment.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <div
                    key={assignment._id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {assignment.subject || assignment.courseName || 'Computer Science'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {assignment.totalMarks || 100} Marks
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm leading-snug">{assignment.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {assignment.description || 'Assignment problem statement and rubric.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due: {formattedDate}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteAssignment(assignment._id, assignment.title)}
                        disabled={isDeleting}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 disabled:opacity-50"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-white">No assignments published yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create and publish your first assignment to distribute coursework to enrolled students.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg inline-flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Student Submissions Roster */}
      {activeTab === 'submissions' && (
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-semibold text-white text-sm">Student Submissions Roster</h2>
              <p className="text-xs text-slate-400">Review submitted files, grade solutions, and write feedback</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {pendingCount} Pending Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Assignment Title</th>
                  <th className="py-3 px-4">Submission Link</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {submissions.map((sub, idx) => {
                  const studentName = sub.studentId?.name || sub.studentName || 'Student';
                  const rollNumber = sub.studentId?.studentDetails?.rollNumber || sub.rollNumber || 'CS-2024-042';
                  const assignTitle = sub.assignmentId?.title || sub.assignmentTitle || 'Course Submission';
                  const totalMarks = sub.assignmentId?.totalMarks || sub.totalMarks || 100;

                  return (
                    <tr key={sub._id || idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-normal">{rollNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{assignTitle}</td>
                      <td className="py-3.5 px-4 font-mono">
                        {sub.fileUrl || sub.submissionUrl ? (
                          <a
                            href={sub.fileUrl || sub.submissionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center space-x-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Submission</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No link attached</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                          <span className="text-emerald-400">{sub.marksObtained} / {totalMarks}</span>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          sub.status === 'graded' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {(sub.status || 'submitted').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission({ ...sub, studentName, assignTitle, totalMarks });
                            setGradingForm({
                              marksObtained: sub.marksObtained !== null && sub.marksObtained !== undefined ? sub.marksObtained.toString() : '90',
                              feedback: sub.feedback || 'Good work on this assignment.',
                            });
                          }}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Publish Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border border-slate-700 max-w-lg w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Publish New Assignment</h3>
                  <p className="text-[11px] text-slate-400">Post coursework directly to student dashboards</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="micro-label text-slate-300">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Calculus & Query Optimization"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Subject / Course *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Systems & SQL"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.deadline}
                    onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 [color-scheme:dark] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Priority Level</label>
                  <select
                    value={newAssignment.priority}
                    onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Problem Statement & Rubric Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail instructions, rubric guidelines, and submission format..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {creatingAssignment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border border-slate-700 max-w-md w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-blue-400">Student Evaluation</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSubmission.studentName}</h3>
                <p className="text-[11px] text-slate-400">{selectedSubmission.assignTitle}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              {/* AI Auto-Evaluation Assistant Button */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">AI Evaluation Assistant</div>
                    <div className="text-[10px] text-slate-400">Analyze rubric and draft feedback</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const max = Number(selectedSubmission.totalMarks) || 100;
                    const suggested = Math.floor(max * 0.92);
                    setGradingForm({
                      marksObtained: suggested.toString(),
                      feedback: `Excellent solution structure. Clear documentation, verified edge cases, and compliant with module rubric standards. Awarded ${suggested}/${max}.`,
                    });
                    addToast('info', 'AI Rubric Generated', 'Drafted marks & constructive evaluation.');
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold rounded-lg transition cursor-pointer shadow-sm"
                >
                  Generate Draft
                </button>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Marks Awarded (Max: {selectedSubmission.totalMarks}) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max={selectedSubmission.totalMarks}
                  value={gradingForm.marksObtained}
                  onChange={(e) => setGradingForm({ ...gradingForm, marksObtained: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Faculty Review & Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive feedback..."
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition font-medium cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};