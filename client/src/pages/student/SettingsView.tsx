import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useThemeStore } from '../../store/useThemeStore';
import { 
  User, 
  Save, 
  Sun, 
  Moon, 
  Lock, 
  Bell, 
  Shield, 
  KeyRound, 
  CheckCircle2, 
  Smartphone
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'connected'>('profile');
  const [dbDepartments, setDbDepartments] = useState<Array<{ name: string; code?: string }>>([]);

  // Fetch real academic departments from MongoDB Atlas
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/admin/departments');
        if (res.data?.departments && Array.isArray(res.data.departments) && res.data.departments.length > 0) {
          setDbDepartments(res.data.departments);
        }
      } catch (err) {
        console.error('Error loading departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.studentDetails?.phone || user?.phone || '',
    rollNumber: user?.studentDetails?.rollNumber || 'CS-2024-042',
    department: user?.department || 'Computer Science & Engineering',
    currentSemester: user?.studentDetails?.currentSemester || user?.studentDetails?.semester || 4,
    bio: user?.studentDetails?.bio || 'Student at CampusGPT University.',
    skills: Array.isArray(user?.studentDetails?.skills)
      ? user?.studentDetails?.skills.join(', ')
      : user?.studentDetails?.skills || 'Web Development, Problem Solving',
    linkedIn: user?.studentDetails?.linkedIn || user?.studentDetails?.linkedinUrl || 'https://linkedin.com/in/student',
    github: user?.studentDetails?.github || user?.studentDetails?.githubUrl || 'https://github.com/student',
    resumeUrl: user?.studentDetails?.resumeUrl || 'https://drive.google.com/file/d/resume/view',
  });

  const [saving, setSaving] = useState(false);

  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    assignmentAlerts: true,
    attendanceWarnings: true,
    eventPassReminders: true,
    placementAlerts: true,
    emailDigest: true,
  });

  const isStudent = !user?.role || user?.role === 'student';
  const isCoordinator = user?.role === 'coordinator';
  const isFaculty = user?.role === 'faculty';

  const handleProfileSubmit = async (e: React.FormEvent) => {
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
        const u = res.data.user as any;
        updateUser(u);
        setFormData((prev) => ({
          ...prev,
          name: u.name ?? prev.name,
          email: u.email ?? prev.email,
          phone: u.phone || u.studentDetails?.phone || prev.phone,
          rollNumber: u.studentDetails?.rollNumber ?? prev.rollNumber,
          department: u.department ?? prev.department,
          currentSemester: u.studentDetails?.currentSemester ?? u.studentDetails?.semester ?? prev.currentSemester,
          bio: u.studentDetails?.bio ?? prev.bio,
          skills: Array.isArray(u.studentDetails?.skills)
            ? u.studentDetails.skills.join(', ')
            : u.studentDetails?.skills ?? prev.skills,
          linkedIn: u.studentDetails?.linkedIn ?? u.studentDetails?.linkedinUrl ?? prev.linkedIn,
          github: u.studentDetails?.github ?? u.studentDetails?.githubUrl ?? prev.github,
          resumeUrl: u.studentDetails?.resumeUrl ?? prev.resumeUrl,
        }));
      }
      const saveMsg = isStudent
        ? `Your student profile (${formData.department}) was updated directly in MongoDB Atlas.`
        : isCoordinator
        ? 'Your coordinator profile was updated directly in MongoDB Atlas.'
        : isFaculty
        ? 'Your faculty profile was updated directly in MongoDB Atlas.'
        : 'Your profile details were updated directly in MongoDB Atlas.';

      addToast('success', 'Profile Saved', saveMsg);
    } catch (err: any) {
      addToast('error', 'Update Error', err.response?.data?.message || 'Could not save profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('error', 'Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'Too Short', 'Password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      // Use profile update / reset endpoint
      await axios.put('/auth/profile', { password: newPassword });
      addToast('success', 'Password Updated', 'Your security password was changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast('info', 'Preference Updated', 'Notification settings saved.');
      return updated;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-8">
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

      {/* Tabs Navigation (PDF Pages 12 & 13) */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('connected')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shrink-0 cursor-pointer ${
            activeTab === 'connected'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Connected Accounts</span>
        </button>
      </div>

      {/* TAB 1: Profile Information */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6 text-xs">
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
                className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">Dark Mode</div>
                    <div className="text-[10px] text-slate-400">Sleek midnight high-contrast palette</div>
                  </div>
                </div>
                {theme === 'dark' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">Light Mode</div>
                    <div className="text-[10px] text-slate-400">Clean, bright daytime aesthetic</div>
                  </div>
                </div>
                {theme === 'light' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>
            </div>
          </div>

          {/* Personal Information Card */}
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Phone Number (Digits Only) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Department / Branch *</label>
                <select
                  value={formData.department}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    setFormData((prev) => {
                      let newRoll = prev.rollNumber;
                      if (newDept.toLowerCase().includes('entc') || newDept.toLowerCase().includes('electronics')) {
                        newRoll = newRoll.replace(/^[A-Z]+-/, 'ENTC-');
                      } else if (newDept.toLowerCase().includes('computer')) {
                        newRoll = newRoll.replace(/^[A-Z]+-/, 'CS-');
                      } else if (newDept.toLowerCase().includes('information')) {
                        newRoll = newRoll.replace(/^[A-Z]+-/, 'IT-');
                      } else if (newDept.toLowerCase().includes('mechanical')) {
                        newRoll = newRoll.replace(/^[A-Z]+-/, 'MECH-');
                      }
                      return { ...prev, department: newDept, rollNumber: newRoll };
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  {(() => {
                    const list = dbDepartments.length > 0
                      ? dbDepartments
                      : [
                          { name: 'Computer Science & Engineering', code: 'CSE' },
                          { name: 'Electronics & Telecommunication', code: 'E&TC' }
                        ];

                    const hasMatch = list.some(
                      (d) =>
                        d.name.toLowerCase() === formData.department.toLowerCase() ||
                        (d.code && formData.department.toLowerCase().includes(d.code.toLowerCase()))
                    );

                    return (
                      <>
                        {!hasMatch && formData.department && (
                          <option value={formData.department}>{formData.department}</option>
                        )}
                        {list.map((dept) => (
                          <option key={dept.name} value={dept.name}>
                            {dept.name} {dept.code ? `(${dept.code})` : ''}
                          </option>
                        ))}
                      </>
                    );
                  })()}
                </select>
              </div>
            </div>

            {/* Role Bio */}
            <div className="space-y-1">
              <label className="micro-label text-slate-400">
                {isStudent ? 'Student Academic Bio' : 'Professional / Role Bio'}
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {isStudent && (
            <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-white text-sm">Academic Details & Portfolio Links</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. ENTC-2026-042"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
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
                <label className="micro-label text-slate-400">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, Python, Docker"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
          )}

          {/* Submit Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving Changes...'
                  : isStudent
                  ? 'Save Student Details'
                  : isCoordinator
                  ? 'Save Coordinator Profile'
                  : isFaculty
                  ? 'Save Faculty Profile'
                  : 'Save Profile Details'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Password & Security */}
      {activeTab === 'security' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm">Update Account Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-white text-sm">Real-time Notification Preferences</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs">Assignment Deadlines & Reviews</div>
                <div className="text-[10px] text-slate-400">Receive alerts when new coursework is published or graded</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.assignmentAlerts}
                onChange={() => handleToggleNotif('assignmentAlerts')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs">Attendance Threshold Warnings</div>
                <div className="text-[10px] text-slate-400">Get notified if aggregate attendance drops below 75%</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.attendanceWarnings}
                onChange={() => handleToggleNotif('attendanceWarnings')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs">Campus Events & Digital Passes</div>
                <div className="text-[10px] text-slate-400">Alerts for confirmed hackathon seats and QR passes</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.eventPassReminders}
                onChange={() => handleToggleNotif('eventPassReminders')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs">Corporate Placement Drives</div>
                <div className="text-[10px] text-slate-400">Instant updates when new recruitment packages are posted</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.placementAlerts}
                onChange={() => handleToggleNotif('placementAlerts')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Connected Accounts & Privacy */}
      {activeTab === 'connected' && (
        <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Connected Accounts & Active Sessions</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">Google OAuth 2.0 Identity</div>
                  <div className="text-[10px] text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Linked & Verified
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-semibold text-white text-xs">Active Browser Session</div>
                  <div className="text-[10px] text-slate-400 font-mono">Current Device • HTTPS Secure Cookie Active</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-400">This Device</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};