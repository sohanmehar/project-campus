import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { User, Code, Save, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const SettingsView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { addToast } = useToastStore();
  const { theme, setTheme } = useThemeStore();

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
    const trimmedPhone = formData.phone.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, '');

    if (!trimmedPhone || digitsOnly.length < 7 || digitsOnly.length > 15 || !/^[+]?[\d\s\-()]{7,16}$/.test(trimmedPhone)) {
      addToast(
        'error',
        'Validation Error',
        'Please enter a valid numeric phone number with digits (e.g., +91 98765 43210 or 10-digit number).'
      );
      return;
    }

    setSaving(true);

    try {
      const res = await axios.put('/auth/profile', {
        ...formData,
        phone: trimmedPhone,
      });
      if (res.data.user) {
        // update local form state with returned user data
        const u = res.data.user as any;
        setFormData((prev) => ({
          ...prev,
          name: u.name ?? prev.name,
          email: u.email ?? prev.email,
          phone: u.phone || u.studentDetails?.phone || prev.phone,
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

  const isStudent = !user?.role || user?.role === 'student';
  const isCoordinator = user?.role === 'coordinator';
  const isFaculty = user?.role === 'faculty';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Account Management</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {isStudent
              ? 'Student Profile & Settings'
              : isCoordinator
              ? 'Coordinator Profile & Settings'
              : isFaculty
              ? 'Faculty Profile & Settings'
              : 'Profile & Settings'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-xs">
        {/* Appearance & Theme Preference */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sun className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Appearance & System Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-950 border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xs">Dark Mode</div>
                  <div className="text-[10px] text-slate-400">Sleek midnight high-contrast palette</div>
                </div>
              </div>
              {theme === 'dark' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10 text-slate-900'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-amber-500">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-xs">Light Mode</div>
                  <div className="text-[10px] text-slate-500">Clean, bright daytime aesthetic</div>
                </div>
              </div>
              {theme === 'light' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
            </button>
          </div>
        </div>

        {/* Basic Personal Information */}
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">Full Name *</label>
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
              <label className="micro-label text-slate-400">
                Phone Number (Digits only) <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="tel"
                required
                pattern="[+]?[0-9\s\-()]{7,16}"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[+]?[\d\s\-()]*$/.test(val)) {
                    setFormData({ ...formData, phone: val });
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Department / Office</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            {isStudent && (
              <>
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
                  <label className="micro-label text-slate-400">Current Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <label className="micro-label text-slate-400">
              {isStudent ? 'Student Bio' : 'Professional / Role Bio'}
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Technical Portfolio & Resume (Students Only) */}
        {isStudent && (
          <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Code className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white text-sm">Portfolio & Placement Links</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Verified Resume PDF Link</label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Student Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};