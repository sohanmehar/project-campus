import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Bell, Plus, ExternalLink, Calendar, X, Search, Filter } from 'lucide-react';

export const FacultyNoticesView: React.FC = () => {
  const { user } = useAuthStore();
  const canPublish = user?.role === 'faculty' || user?.role === 'admin';
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'announcement' | 'study_material'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: 'Database Systems & SQL',
    noticeType: 'announcement',
    attachmentUrl: '',
  });

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/faculty/notices');
      let noticeList = response.data.notices || [];

      // Fallback seed for display if collection is empty
      if (noticeList.length === 0) {
        noticeList = [
          {
            _id: 'n-1',
            title: 'End-Semester Lab Examination Schedule',
            content: 'The practical database systems viva and query optimization lab assessment will be held next Tuesday at 10:00 AM in Lab 304.',
            subject: 'Database Systems & SQL',
            noticeType: 'announcement',
            facultyName: 'Dr. Sarah Jenkins',
            createdAt: new Date().toISOString(),
            attachmentUrl: '',
          },
          {
            _id: 'n-2',
            title: 'Unit 3 Normalization & B-Tree Indexing Reference Slides',
            content: 'Reference lecture slides covering 1NF through BCNF, complete with worked index tree traversal examples.',
            subject: 'Database Systems & SQL',
            noticeType: 'study_material',
            facultyName: 'Dr. Sarah Jenkins',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            attachmentUrl: 'https://github.com/campusgpt/db-unit3-slides.pdf',
          },
        ];
      }

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
    if (!formData.title || !formData.content) return;

    setSaving(true);
    try {
      await axios.post('/faculty/notices', formData);
      addToast(
        'success',
        formData.noticeType === 'study_material' ? 'Study Material Published' : 'Notice Published',
        `'${formData.title}' is now visible on student and department noticeboards.`
      );
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        subject: 'Database Systems & SQL',
        noticeType: 'announcement',
        attachmentUrl: '',
      });
      fetchNotices();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not publish notice.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading department noticeboard & study materials...</p>
      </div>
    );
  }

  const filteredNotices = notices.filter((n) => {
    const matchesType = filterType === 'all' || n.noticeType === filterType;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Department Communications</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Notices & Study Materials</h1>
        </div>
        {canPublish && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice / Material</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notices or study materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Posts ({notices.length})
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'announcement'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setFilterType('study_material')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'study_material'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Study Materials
          </button>
        </div>
      </div>

      {/* Notice Feed Cards */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((item) => (
            <div key={item._id} className="stitch-card p-5 bg-slate-900 border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      item.noticeType === 'study_material'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {item.noticeType === 'study_material' ? 'STUDY MATERIAL' : 'ANNOUNCEMENT'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{item.subject}</span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">Posted by: <strong className="text-slate-200">{item.facultyName || 'Faculty Member'}</strong></span>

                {item.attachmentUrl && (
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View / Download Attachment</span>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="stitch-card p-8 bg-slate-900 border-slate-800 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-6 h-6 mx-auto text-slate-600" />
            <p>No notices or study materials matched your search filter.</p>
          </div>
        )}
      </div>

      {/* Publish Notice / Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Publish Communication</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Post Type</label>
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
                <label className="micro-label text-slate-400">Subject / Module</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4 SQL Optimization Slides"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Detailed Message / Summary</label>
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
                <label className="micro-label text-slate-400">Attachment / File Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... or PDF link"
                  value={formData.attachmentUrl}
                  onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish to Noticeboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
