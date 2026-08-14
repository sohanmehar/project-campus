import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, Shield, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Handled in Zustand store
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin({ credential: credentialResponse.credential });
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
    }
  };

  const handleGoogleDemoLogin = async () => {
    try {
      await googleLogin({
        demoUser: {
          name: 'Alex Mercer (Google Verified)',
          email: 'alex.student@campusgpt.edu',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Google Fast Pass Error:', err);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword('Password123!');
    try {
      await login({ email: demoEmail, password: 'Password123!' });
      navigate('/dashboard', { replace: true });
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

        <div className="stitch-card p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800 space-y-5 rounded-2xl">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center">
              <span>{error}</span>
            </div>
          )}

          {/* Official Google OAuth 2.0 Login */}
          <div className="space-y-2.5">
            <div className="flex justify-center w-full overflow-hidden rounded-xl">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                width="340"
              />
            </div>

            {/* Fast-Pass Demo Fallback */}
            <button
              type="button"
              onClick={handleGoogleDemoLogin}
              className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-medium rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer hover:border-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>1-Click Google Fast Pass (Evaluator Demo)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-mono text-slate-500 shrink-0">
              Or Sign In With Email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Login Switcher */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="micro-label text-slate-500">Hackathon Demo Switcher</span>
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex.student@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-white text-xs">Student</div>
                <div className="text-[10px] text-slate-400">Alex Mercer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.faculty@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-white text-xs">Faculty</div>
                <div className="text-[10px] text-slate-400">Dr. Jenkins</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcus.coordinator@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-white text-xs">Coordinator</div>
                <div className="text-[10px] text-slate-400">Marcus Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-white text-xs">Admin</div>
                <div className="text-[10px] text-slate-400">Dr. Thorne</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};