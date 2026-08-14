import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  BookOpen, 
  Upload, 
  CheckCircle, 
  X, 
  Award,
  Link as LinkIcon,
  ExternalLink,
  Code,
  FileText,
  Archive,
  Clock,
  MessageSquare
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  useAuthStore();
  const { addToast } = useToastStore();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssignment, setSelectedSubmissionAssignment] = useState<any | null>(null);
  const [submissionType, setSubmissionType] = useState<'github' | 'pdf' | 'zip'>('github');
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
        fileUrl: submissionUrl.trim(),
        submissionUrl: submissionUrl.trim(),
        submissionType,
      });

      addToast(
        'success',
        'Solution Submitted',
        `Your ${submissionType.toUpperCase()} submission for '${selectedAssignment.title}' was recorded in MongoDB Atlas.`
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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Coursework & Evaluation</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Assignments & Submissions Portal</h1>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            {assignments.length} Active Modules
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            {submissions.length} Completed
          </span>
        </div>
      </div>

      {/* Coursework Cards Grid */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Coursework Tasks</h2>
            <p className="text-xs text-slate-400">Review problem statements and upload GitHub repo, PDF, or ZIP solution links</p>
          </div>
          <BookOpen className="w-4 h-4 text-blue-400" />
        </div>

        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {assignments.map((assignment) => {
              // Robust Multi-Factor Matching against Student Database Submissions
              const existingSub = submissions.find((s) => {
                const subAssignId = String(s.assignmentId?._id || s.assignmentId || '');
                const targetAssignId = String(assignment._id || '');
                const titleMatch = s.assignmentTitle === assignment.title;
                return (subAssignId && subAssignId === targetAssignId) || titleMatch;
              });

              const isLate = existingSub && assignment.deadline && new Date(existingSub.createdAt || existingSub.submittedAt) > new Date(assignment.deadline);

              return (
                <div key={assignment._id} className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {assignment.subject || 'Computer Science'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        Max Marks: {assignment.totalMarks || 100}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-xs sm:text-sm">{assignment.title}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{assignment.description || 'No detailed instructions provided.'}</p>
                    </div>

                    {/* If submitted: show submission metadata & feedback */}
                    {existingSub && (
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-500" />
                            <span>Submitted: {new Date(existingSub.createdAt || existingSub.submittedAt).toLocaleDateString()}</span>
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${
                            isLate ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isLate ? 'Late Submission' : 'On Time'}
                          </span>
                        </div>

                        {(existingSub.fileUrl || existingSub.submissionUrl) && (
                          <div className="flex items-center space-x-1 text-blue-400 truncate">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <a
                              href={existingSub.fileUrl || existingSub.submissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="underline truncate text-[10px] font-mono"
                            >
                              {existingSub.fileUrl || existingSub.submissionUrl}
                            </a>
                          </div>
                        )}

                        {existingSub.feedback && (
                          <div className="text-slate-300 pt-1 border-t border-slate-800 flex items-start space-x-1 text-[10px]">
                            <MessageSquare className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                            <span>Feedback: <em>{existingSub.feedback}</em></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-900 text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      DUE: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'N/A'}
                    </span>

                    <div className="self-end sm:self-auto">
                      {existingSub ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>SUBMITTED</span>
                          </span>

                          {existingSub.marks !== undefined && existingSub.marks !== null && (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center space-x-1">
                              <Award className="w-3 h-3" />
                              <span>{existingSub.marks}/{assignment.totalMarks || 100}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubmissionAssignment(assignment)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition shadow-lg shadow-blue-600/20 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Submit Solution</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No coursework assignments currently pending.
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="stitch-card p-5 sm:p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="min-w-0 flex-1 mr-2">
                <span className="micro-label text-blue-400">Submission Portal</span>
                <h3 className="text-sm font-bold text-white truncate">{selectedAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedSubmissionAssignment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4 text-xs">
              {/* Type Select */}
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Submission Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('github')}
                    className={`py-2 px-2 rounded-lg border text-center transition font-semibold flex flex-col items-center space-y-1 cursor-pointer ${
                      submissionType === 'github'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px]">GitHub Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionType('pdf')}
                    className={`py-2 px-2 rounded-lg border text-center transition font-semibold flex flex-col items-center space-y-1 cursor-pointer ${
                      submissionType === 'pdf'
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px]">Cloud PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionType('zip')}
                    className={`py-2 px-2 rounded-lg border text-center transition font-semibold flex flex-col items-center space-y-1 cursor-pointer ${
                      submissionType === 'zip'
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Archive className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px]">ZIP Archive</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">
                  {submissionType === 'github'
                    ? 'GitHub Repository URL *'
                    : submissionType === 'pdf'
                    ? 'Public PDF Document URL *'
                    : 'Project ZIP Download URL *'}
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="url"
                    required
                    placeholder={
                      submissionType === 'github'
                        ? 'https://github.com/username/project'
                        : submissionType === 'pdf'
                        ? 'https://drive.google.com/file/d/...'
                        : 'https://dropbox.com/s/submission.zip'
                    }
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Ensure access permissions are configured for instructor evaluation.</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionAssignment(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !submissionUrl.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  {submitting ? 'Uploading...' : 'Submit Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};