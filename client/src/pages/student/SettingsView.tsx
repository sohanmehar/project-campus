import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { User, Mail, Phone, BookOpen, Globe, Code, FileText, Save, CheckCircle2, Shield } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.studentDetails?.phone || '',
    rollNumber: user?.studentDetails?.rollNumber || 'CS-2024-042',
    department: user?.department || 'Computer Science',
    currentSemester: user?.studentDetails?.currentSemester || 4,
    bio: user?.studentDetails?.bio || 'Computer Engineering Student passionate about web infrastructure and distributed systems.',
    skills: Array.isArray(user?.studentDetails?.skills)
      ? user?.studentDetails?.skills.join(', ')
      : user?.studentDetails?.skills || 'React, Node.js, TypeScript, MongoDB, Python',
    linkedIn: user?.studentDetails?.linkedIn || 'https://linkedin.com/in/student',
    github: user?.studentDetails?.github || 'https://github.com/student',
    resumeUrl: user?.studentDetails?.resumeUrl || 'https://drive.google.com/file/d/resume/view',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put('/auth/profile', formData);
      if (res.data.user) {
        // update local form state with returned user data (avoid relying on store setter)
        const u = res.data.user as any;
        setFormData((prev) => ({
          ...prev,
          name: u.name ?? prev.name,
          email: u.email ?? prev.email,
          phone: u.studentDetails?.phone ?? prev.phone,
          rollNumber: u.studentDetails?.rollNumber ?? prev.rollNumber,
          department: u.department ?? prev.department,
          currentSemester: u.studentDetails?.currentSemester ?? prev.currentSemester,
          bio: u.studentDetails?.bio ?? prev.bio,
          skills: Array.isArray(u.studentDetails?.skills)
            ? u.studentDetails.skills.join(', ')
            : u.studentDetails?.skills ?? prev.skills,
          linkedIn: u.studentDetails?.linkedIn ?? prev.linkedIn,
          github: u.studentDetails?.github ?? prev.github,
          resumeUrl: u.studentDetails?.resumeUrl ?? prev.resumeUrl,
        }));
      }
      addToast('success', 'Profile Saved', 'Your student details were updated directly in MongoDB Atlas.');
    } catch (err: any) {
      addToast('error', 'Update Error', err.response?.data?.message || 'Could not save profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Account Management</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Student Profile & Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Personal Information */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Roll Number</label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Department</label>
              <input
                type="text"
                disabled
                value={formData.department}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Current Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="micro-label text-slate-400">Student Bio / Objective</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Developer Links & Resume */}
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Code className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-white text-sm">Skills, Links & Resume</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">Technical Skills (Comma Separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, TypeScript, C++, Python"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">GitHub Profile URL</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Resume Link (Google Drive / PDF URL)</label>
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};