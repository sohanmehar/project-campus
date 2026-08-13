import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToastStore } from '../../store/useToastStore';
import { Plus, ExternalLink, X } from 'lucide-react';

export const FacultyGradeAssignmentsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradingForm, setGradingForm] = useState({ marksObtained: '', feedback: '' });
  const { addToast } = useToastStore();

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: 'Database Systems & SQL',
    deadline: '',
    totalMarks: '100',
  });

  const fetchFacultyAssignmentsData = async () => {
    try {
      const subRes = await axios.get('/faculty/submissions');
      setSubmissions(subRes.data.submissions || []);
    } catch (err) {
      console.error('Error fetching assignment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyAssignmentsData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.deadline) return;

    try {
      await axios.post('/faculty/assignments', newAssignment);
      addToast('success', 'Assignment Published', `'${newAssignment.title}' sent to student portal.`);
      setIsCreateModalOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: 'Database Systems & SQL',
        deadline: '',
        totalMarks: '100',
      });
      fetchFacultyAssignmentsData();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not publish assignment.');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const targetId = selectedSubmission._id;
      const newMarks = Number(gradingForm.marksObtained);
      const newFeedback = gradingForm.feedback;

      await axios.patch(`/faculty/submissions/${targetId}/grade`, {
        marksObtained: newMarks,
        feedback: newFeedback,
      });

      addToast('success', 'Grade Saved', `Grade persisted to MongoDB for ${selectedSubmission.studentName}.`);

      setSelectedSubmission(null);
      
      // Re-fetch clean populated data directly from MongoDBAtlas
      await fetchFacultyAssignmentsData();
    } catch (err: any) {
      console.error('Grading submission error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not save grade.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading faculty assignment grading workspace...</p>
      </div>
    );
  }

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Review</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Assignments & Grading Portal</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Submissions Pending Review Table */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Student Submissions Roster</h2>
            <p className="text-xs text-slate-400">Review attached work, assign marks, and issue feedback</p>
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
                            marksObtained: sub.marksObtained?.toString() || '90',
                            feedback: sub.feedback || 'Good attempt on query optimization.',
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg transition"
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

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Publish New Assignment</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Calculus & Query Plans"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Subject</label>
                  <input
                    type="text"
                    required
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Total Marks</label>
                  <input
                    type="number"
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Deadline Date</label>
                <input
                  type="date"
                  required
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Problem Statement Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail submission requirements and rubrics..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-blue-400">Student Evaluation</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSubmission.studentName}</h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Marks Awarded (Out of {selectedSubmission.totalMarks})</label>
                <input
                  type="number"
                  required
                  value={gradingForm.marksObtained}
                  onChange={(e) => setGradingForm({ ...gradingForm, marksObtained: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Faculty Review & Feedback</label>
                <textarea
                  rows={3}
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
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