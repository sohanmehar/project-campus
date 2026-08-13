import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  BookOpen, 
  Upload, 
  CheckCircle, 
  ExternalLink, 
  X, 
  Award,
  Link as LinkIcon
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  useAuthStore();
  const { addToast } = useToastStore();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssignment, setSelectedSubmissionAssignment] = useState<any | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudentAssignments = async () => {
    try {
      const [assignRes, subRes] = await Promise.allSettled([
        axios.get('/assignments'),
        axios.get('/assignments/my-submissions'),
      ]);

      let assignList: any[] = [];
      if (assignRes.status === 'fulfilled' && assignRes.value.data?.assignments) {
        assignList = assignRes.value.data.assignments;
      }

      let subList: any[] = [];
      if (subRes.status === 'fulfilled' && subRes.value.data?.submissions) {
        subList = subRes.value.data.submissions;
      }

      setAssignments(assignList);
      setSubmissions(subList);
    } catch (err) {
      console.error('Error fetching student assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAssignments();
  }, []);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionUrl.trim()) return;

    setSubmitting(true);
    try {
      await axios.post('/assignments/submit', {
        assignmentId: selectedAssignment._id,
        fileUrl: submissionUrl,
        submissionUrl: submissionUrl,
      });

      addToast(
        'success',
        'Solution Submitted',
        `Your solution for '${selectedAssignment.title}' was recorded in MongoDB Atlas.`
      );

      setSelectedSubmissionAssignment(null);
      setSubmissionUrl('');
      fetchStudentAssignments();
    } catch (err: any) {
      addToast('error', 'Submission Error', err.response?.data?.message || 'Could not submit solution.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading student assignment records from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Coursework & Evaluation</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Assignments & Submissions Portal</h1>
        </div>

        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          {assignments.length} Active Modules
        </span>
      </div>

      {/* Coursework Cards Grid */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Coursework Tasks</h2>
            <p className="text-xs text-slate-400">Review problem statements and upload solution links</p>
          </div>
          <BookOpen className="w-4 h-4 text-blue-400" />
        </div>

        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((assignment) => {
              // Robust Multi-Factor Matching against Student Database Submissions
              const existingSub = submissions.find((s) => {
                const subAssignId = String(s.assignmentId?._id || s.assignmentId || '');
                const targetAssignId = String(assignment._id || '');
                const titleMatch = s.assignmentTitle === assignment.title;
                return (subAssignId && subAssignId === targetAssignId) || titleMatch;
              });

              return (
                <div key={assignment._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {assignment.subject || 'Computer Science'}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      Max Marks: {assignment.totalMarks || 100}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-xs">{assignment.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{assignment.description || 'No detailed instructions provided.'}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      DUE: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'N/A'}
                    </span>

                    {existingSub ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center space-x-1 font-mono">
                        <CheckCircle className="w-3 h-3" />
                        <span>SUBMITTED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedSubmissionAssignment(assignment)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition shadow-md shadow-blue-600/20"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Submit Solution</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No coursework assignments have been published in MongoDB Atlas for your department yet.
          </div>
        )}
      </div>

      {/* Submission History Log */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Submission History & Grades</h2>
            <p className="text-xs text-slate-400">Recorded solutions, scores, and faculty review notes</p>
          </div>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Solution Link</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Grade Awarded</th>
                  <th className="py-3 px-4">Faculty Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {submissions.map((sub, idx) => (
                  <tr key={sub._id || idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {sub.assignmentId?.title || sub.assignmentTitle || 'Coursework Submission'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {sub.fileUrl || sub.submissionUrl ? (
                        <a
                          href={sub.fileUrl || sub.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center space-x-1 text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Solution</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">No link</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          sub.status === 'graded'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {(sub.status || 'submitted').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                        <span className="text-emerald-400">{sub.marksObtained} / {sub.totalMarks || 100}</span>
                      ) : (
                        <span className="text-slate-500">Pending Evaluation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 italic">
                      {sub.feedback || 'No review notes provided yet.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No solution submissions recorded in MongoDB for your account yet.
          </div>
        )}
      </div>

      {/* Solution Upload Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-blue-400">Solution Submission</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedAssignment.title}</h3>
              </div>
              <button onClick={() => setSelectedSubmissionAssignment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Solution Link (GitHub Repository / Google Drive PDF / ZIP)</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project-repo or Drive link"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
                <p>• Ensure your repository or PDF document permission is set to <strong>Public</strong>.</p>
                <p>• Submission timestamp will be saved to MongoDB Atlas upon submit.</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionAssignment(null)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Upload & Submit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};