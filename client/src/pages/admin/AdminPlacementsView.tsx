import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToastStore } from '../../store/useToastStore';
import { Plus, Trash2, MapPin, X } from 'lucide-react';

export const AdminPlacementsView: React.FC = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    ctc: '',
    location: 'Bangalore, India',
    registrationUrl: '',
    minCgpa: '7.5',
    requiredSkills: '',
    description: '',
  });

  const fetchDrives = async () => {
    try {
      const response = await axios.get('/placements/drives');
      setDrives(response.data.drives || response.data.placements || []);
    } catch (err) {
      console.error('Error fetching placement drives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobRole || !formData.ctc) return;

    setSubmitting(true);
    try {
      await axios.post('/placements/drives', formData);
      addToast('success', 'Drive Created', `${formData.companyName} drive added to system.`);
      setIsModalOpen(false);
      setFormData({
        companyName: '',
        jobRole: '',
        ctc: '',
        location: 'Bangalore, India',
        registrationUrl: '',
        minCgpa: '7.5',
        requiredSkills: '',
        description: '',
      });
      fetchDrives();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not create drive.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDrive = async (id: string, company: string) => {
    try {
      await axios.delete(`/placements/drives/${id}`);
      addToast('info', 'Drive Removed', `${company} drive has been deleted.`);
      fetchDrives();
    } catch (err) {
      addToast('error', 'Error', 'Could not delete drive.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading placement management hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Career & Placements Portal</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Placement Drive Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Drive</span>
        </button>
      </div>

      {/* Drive Grid for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drives.map((drive) => (
          <div key={drive._id} className="stitch-card p-5 bg-slate-900 border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {drive.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{drive.companyName}</h3>
                    <p className="text-xs text-slate-400">{drive.jobRole}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono rounded-lg">
                  {drive.ctc} LPA
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{drive.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {drive.eligibility?.requiredSkills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>

              {drive.registrationUrl && (
                <div className="text-[11px] text-blue-400 font-mono flex items-center space-x-1 truncate">
                  <span>Registration Link:</span>
                  <a href={drive.registrationUrl} target="_blank" rel="noreferrer" className="underline truncate hover:text-blue-300">
                    {drive.registrationUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-500" /> {drive.location}
                </span>
                <span>• Min CGPA: <strong className="text-white">{drive.eligibility?.minCgpa || 7.5}</strong></span>
              </div>

              <button
                onClick={() => handleDeleteDrive(drive._id, drive.companyName)}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium rounded-lg flex items-center space-x-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-lg w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Post New Recruitment Drive</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Job Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE-1"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">CTC Package (LPA) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 24"
                    value={formData.ctc}
                    onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Min Cutoff CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Registration / Application URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/apply or Google Form"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Required Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Java, AWS, System Design, React"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe job scope and hiring expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
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
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Post Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};