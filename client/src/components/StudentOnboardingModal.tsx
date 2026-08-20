import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert, CheckCircle2, Lock, User, Phone, BookOpen, Hash, ArrowRight } from 'lucide-react';

export const StudentOnboardingModal: React.FC = () => {
  const { user, completeOnboarding, isLoading, error } = useAuthStore();

  const [rollNumber, setRollNumber] = useState(user?.studentDetails?.rollNumber || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [semester, setSemester] = useState(user?.studentDetails?.semester || 1);
  const [skills, setSkills] = useState(user?.studentDetails?.skills ? user.studentDetails.skills.join(', ') : '');
  const [bio, setBio] = useState(user?.studentDetails?.bio || '');
  const [localError, setLocalError] = useState<string | null>(null);

  // Show modal only if user is logged in as a student AND profile is NOT locked
  if (!user || user.role !== 'student' || user.profileLocked) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim() || !phone.trim() || !department.trim()) {
      setLocalError('Roll Number / USN, Phone, and Department are required.');
      return;
    }

    try {
      setLocalError(null);
      await completeOnboarding({
        rollNumber: rollNumber.trim(),
        phone: phone.trim(),
        department: department.trim(),
        semester: Number(semester),
        skills,
        bio,
      });
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Failed to submit profile onboarding.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="stitch-card p-6 sm:p-8 bg-slate-900 border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl space-y-5 relative">
        <div className="flex items-start space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Required Student Profile Onboarding</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Please enter your official university details below. Once submitted, your profile will be <span className="text-amber-400 font-semibold">permanently locked</span> against self-editing to preserve database integrity.
            </p>
          </div>
        </div>

        {(localError || error) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">USN / Roll Number *</label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1RV22CS042"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Phone Number *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="micro-label text-slate-400">Academic Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Science & Engineering">Information Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="micro-label text-slate-400">Technical Skills (Comma Separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Python, SQL, Machine Learning"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="micro-label text-slate-400">Short Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a brief overview of your academic interests and career goals..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Important: Double-check your USN and Phone Number. Modifications after submission require Admin approval.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !rollNumber || !phone}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Locking Profile & Submitting...' : 'Submit & Lock Profile Details'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
