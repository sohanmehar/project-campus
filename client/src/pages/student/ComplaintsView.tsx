import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { AlertCircle, Plus, Send, X } from 'lucide-react';

export const ComplaintsView: React.FC = () => {
  useAuthStore();
  const { addToast } = useToastStore();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'IT & Wi-Fi',
    location: 'Main Library',
    priority: 'medium',
    description: '',
  });

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/complaints/my-tickets');
      if (res.data?.complaints) {
        setTickets(res.data.complaints);
      }
    } catch (err) {
      console.error('Error loading grievance tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setSubmitting(true);
    try {
      await axios.post('/complaints', formData);
      addToast('success', 'Grievance Registered', 'Your support ticket was saved directly to MongoDB Atlas.');
      setShowModal(false);
      setFormData({ category: 'IT & Wi-Fi', location: 'Main Library', priority: 'medium', description: '' });
      fetchTickets();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading grievance tickets from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-rose-400">Student Support & Resolution</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Grievance Portal</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-rose-600/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Support Tickets</h2>
            <p className="text-xs text-slate-400">Track resolution updates from administrative cells</p>
          </div>
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-3">
            {/* Mobile Card List View for Phones */}
            <div className="grid grid-cols-1 md:hidden gap-3">
              {tickets.map((t) => (
                <div key={t._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">#{t._id.slice(-6).toUpperCase()}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : t.status === 'in-progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {t.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">{t.category}</span>
                    <span className="text-slate-400">{t.location}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{t.description}</p>
                  <div className="pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                    Logged: {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Logged On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-mono text-slate-300">#{t._id.slice(-6).toUpperCase()}</td>
                      <td className="py-3 px-4 font-semibold text-white">{t.category}</td>
                      <td className="py-3 px-4 text-slate-400">{t.location}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{t.description}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border uppercase ${
                            t.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : t.status === 'in-progress'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {t.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No grievance tickets currently on file. All campus operations running smoothly.
          </div>
        )}
      </div>

      {/* Lodge Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="stitch-card p-5 sm:p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Lodge Grievance / Maintenance Ticket</h3>
                <p className="text-[11px] text-slate-400">Directly alerts campus administrative cells</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Issue Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                >
                  <option value="IT & Wi-Fi">IT, Lab Terminals & Campus Wi-Fi</option>
                  <option value="Hostel & Facilities">Hostel Room & Mess Quality</option>
                  <option value="Academics">Coursework & Faculty Evaluation</option>
                  <option value="Library">Library Resources & Books</option>
                  <option value="Sanitation">Campus Cleanliness & Water</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Campus Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block C Lab 3"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">Urgent Escalation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue with specific details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.description.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <Send className="w-3 h-3" />
                  <span>{submitting ? 'Lodging...' : 'Lodge Grievance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};