import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Bell, Plus, ExternalLink, Calendar, X, Search, Filter, Trash2, FileText, Sparkles, BookOpen } from 'lucide-react';

export const FacultyNoticesView: React.FC = () => {
  const { user } = useAuthStore();
  const isCoordinator = user?.role === 'coordinator';
  const canPublish = user?.role === 'faculty' || user?.role === 'admin' || isCoordinator;
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'announcement' | 'study_material'>(
    isCoordinator ? 'announcement' : 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: isCoordinator ? 'Campus Activities & Clubs' : 'Database Systems & SQL',
    noticeType: 'announcement',
    attachmentUrl: '',
    department: user?.department || (isCoordinator ? 'Student Affairs' : 'Computer Science & Engineering'),
  });

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/faculty/notices');
      const noticeList = response.data.notices || [];
      setNotices(noticeList);
    } catch (err) {
      console.error('Error fetching notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      addToast('error', 'Validation Error', 'Title and content are required.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/faculty/notices', {
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        department: user?.department || 'Computer Science & Engineering',
      });

      addToast(
        'success',
        formData.noticeType === 'study_material' ? 'Study Material Published' : 'Notice Published',
        `'${formData.title}' is now visible on student dashboards and department noticeboards.`
      );
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        subject: 'Database Systems & SQL',
        noticeType: 'announcement',
        attachmentUrl: '',
        department: user?.department || 'Computer Science & Engineering',
      });
      await fetchNotices();
    } catch (err: any) {
      console.error('Create notice error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not publish notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`/faculty/notices/${id}`);
      addToast('success', 'Notice Deleted', `'${title}' was removed from the board.`);
      await fetchNotices();
    } catch (err: any) {
      console.error('Delete notice error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not delete notice.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading department noticeboard & study materials...</p>
      </div>
    );
  }

  const filteredNotices = notices.filter((n) => {
    const matchesType = filterType === 'all' || n.noticeType === filterType;
    const matchesSearch =
      (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.subject && n.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.facultyName && n.facultyName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const announcementCount = notices.filter((n) => n.noticeType === 'announcement').length;
  const studyMaterialCount = notices.filter((n) => n.noticeType === 'study_material').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">
              {isCoordinator ? 'Activity Communications' : 'Department Communications'}
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
              Live Feed
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {isCoordinator ? 'Campus Announcements & Circulars' : 'Notices & Study Materials'}
          </h1>
        </div>

        {canPublish && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isCoordinator ? 'Broadcast Announcement' : 'Publish Notice / Material'}</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3 rounded-2xl">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{notices.length}</div>
            <div className="text-[11px] text-slate-400">
              {isCoordinator ? 'Total Circulars' : 'Total Department Posts'}
            </div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3 rounded-2xl">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-400">{announcementCount}</div>
            <div className="text-[11px] text-slate-400">Active Announcements</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3 rounded-2xl">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-purple-400">{studyMaterialCount}</div>
            <div className="text-[11px] text-slate-400">Study Materials / PDFs</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3 rounded-2xl">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-amber-400">Verified</div>
            <div className="text-[11px] text-slate-400">
              {isCoordinator ? 'Coordinator Broadcast' : 'Faculty Broadcast'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search notices, faculty, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Posts ({notices.length})
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterType === 'announcement'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Announcements ({announcementCount})
          </button>
          <button
            onClick={() => setFilterType('study_material')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterType === 'study_material'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Study Materials ({studyMaterialCount})
          </button>
        </div>
      </div>

      {/* Notice Feed Cards */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((item) => {
            const isDeleting = deletingId === item._id;
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={item._id}
                className="stitch-card p-5 bg-slate-900 border-slate-800 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border font-mono ${
                        item.noticeType === 'study_material'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {item.noticeType === 'study_material' ? 'STUDY MATERIAL' : 'ANNOUNCEMENT'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      {item.subject || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formattedDate}</span>
                    </div>

                    {canPublish && (
                      <button
                        onClick={() => handleDeleteNotice(item._id, item.title)}
                        disabled={isDeleting}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition cursor-pointer disabled:opacity-50"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{item.content}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Posted by: <strong className="text-blue-400">{item.facultyName || 'Dr. Sarah Jenkins'}</strong>
                  </span>

                  {item.attachmentUrl && (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-semibold rounded-lg flex items-center space-x-1.5 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Download Attached Resource</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="stitch-card p-12 bg-slate-900 border-slate-800 text-center text-xs text-slate-500 space-y-2 rounded-2xl">
            <Bell className="w-8 h-8 mx-auto text-slate-600" />
            <div className="text-sm font-semibold text-white">No notices found</div>
            <p>No notices or study materials matched your search filter.</p>
          </div>
        )}
      </div>

      {/* Publish Notice / Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border border-slate-700 max-w-md w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Publish Communication</h3>
                  <p className="text-[11px] text-slate-400">Post notice or study materials for students</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-300">Post Type</label>
                <select
                  value={formData.noticeType}
                  onChange={(e) => setFormData({ ...formData, noticeType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="announcement">Announcement / Notice</option>
                  <option value="study_material">Study Material / Reference PDF</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Subject / Module *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4 SQL Optimization Slides & Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Detailed Message / Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete details or instructions for students..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Attachment / Google Drive Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or PDF link"
                  value={formData.attachmentUrl}
                  onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {saving ? 'Publishing...' : 'Publish to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
