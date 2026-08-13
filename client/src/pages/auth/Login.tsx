import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, Shield, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate(); // <--- Instantiate navigate hook

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true }); // <--- Explicit navigation
    } catch (err) {
      // Handled in Zustand store
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword('Password123!');
    try {
      await login({ email: demoEmail, password: 'Password123!' });
      navigate('/dashboard', { replace: true }); // <--- Explicit navigation
    } catch (err) {
      console.error('Quick login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>CampusGPT Enterprise OS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Sign in to CampusGPT</h1>
          <p className="text-xs text-slate-400">One campus. One platform. One intelligent AI layer.</p>
        </div>

        <div className="stitch-card p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label className="micro-label text-slate-400">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusgpt.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="micro-label text-slate-400">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Login Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="micro-label text-slate-500">Hackathon Demo Switcher</span>
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex.student@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 text-left transition"
              >
                <div className="font-semibold text-white">Student</div>
                <div className="text-[10px] text-slate-500">Alex Mercer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.faculty@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 text-left transition"
              >
                <div className="font-semibold text-white">Faculty</div>
                <div className="text-[10px] text-slate-500">Dr. Jenkins</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcus.coordinator@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 text-left transition"
              >
                <div className="font-semibold text-white">Coordinator</div>
                <div className="text-[10px] text-slate-500">Marcus Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 text-left transition"
              >
                <div className="font-semibold text-white">Admin</div>
                <div className="text-[10px] text-slate-500">Dr. Thorne</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};