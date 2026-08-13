import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { AlertCircle, Plus, Send, X } from 'lucide-react';

export const ComplaintsView: React.FC = () => {
  const { user } = useAuthStore();
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-rose-400">Student Support & Resolution</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Grievance Portal</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Support Tickets</h2>
            <p className="text-xs text-slate-400">Track resolution updates from administrative cells</p>
          </div>
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>

        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">{t.ticketId || 'CMP-2026-000'}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{t.category}</td>
                    <td className="py-3.5 px-4 text-slate-400">{t.location || 'Campus Main'}</td>
                    <td className="py-3.5 px-4 text-slate-200 max-w-xs truncate">{t.description}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          t.priority?.toLowerCase() === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {(t.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border font-mono ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {(t.status || 'Submitted').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No grievance tickets logged under your account yet.
          </div>
        )}
      </div>

      {/* Lodge Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-rose-400">Grievance Registration</span>
                <h3 className="text-base font-bold text-white mt-0.5">Lodge Support Ticket</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="IT & Wi-Fi">IT & Wi-Fi</option>
                    <option value="Academic">Academic</option>
                    <option value="Hostel & Housing">Hostel & Housing</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="General">General Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Location / Block</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C Library 3rd Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the problem context and reference details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Register Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};