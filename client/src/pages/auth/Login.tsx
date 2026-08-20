import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, Shield, ArrowRight, Lock, Mail, KeyRound, X, CheckCircle2, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Forgot Password / Reset State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

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

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await axios.post('/auth/forgot-password', { email: resetEmail.trim() });
      if (res.data?.otp) {
        setResetOtp(res.data.otp); // Pre-fill generated OTP for instant testing
      }
      setResetSuccess(res.data.message || 'OTP verification code generated.');
      setResetStep('verify');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Failed to initiate password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim() || !newPassword) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await axios.post('/auth/reset-password', {
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });
      setResetSuccess(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setPassword(newPassword);
        setEmail(resetEmail);
      }, 1500);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider hover:border-blue-500/40 transition">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>CampusGPT Enterprise OS</span>
          </Link>
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
              disabled={isLoading}
              onClick={handleGoogleDemoLogin}
              className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-medium rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer hover:border-slate-700 disabled:opacity-50"
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
              <span>1-Click Google Fast Pass (Demo Mode)</span>
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
              <div className="flex items-center justify-between">
                <label className="micro-label text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setResetStep('request');
                    setResetError(null);
                    setResetSuccess(null);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
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
              <span className="micro-label text-slate-500">Quick Role Switcher (Test Accounts)</span>
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('alex.student@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer disabled:opacity-50"
              >
                <div className="font-semibold text-white text-xs">Student</div>
                <div className="text-[10px] text-slate-400">Alex Mercer</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('sarah.faculty@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer disabled:opacity-50"
              >
                <div className="font-semibold text-white text-xs">Faculty</div>
                <div className="text-[10px] text-slate-400">Dr. Jenkins</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('marcus.coordinator@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer disabled:opacity-50"
              >
                <div className="font-semibold text-white text-xs">Coordinator</div>
                <div className="text-[10px] text-slate-400">Marcus Vance</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('admin@campusgpt.edu')}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-left transition cursor-pointer disabled:opacity-50"
              >
                <div className="font-semibold text-white text-xs">Admin</div>
                <div className="text-[10px] text-slate-400">Dr. Thorne</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 pt-1">
          © 2026 CampusGPT Enterprise OS. Built by Sohan Mehar & Suchitra Karde.
        </p>
      </div>

      {/* Forgot Password / OTP Reset Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="stitch-card p-6 sm:p-7 bg-slate-900 border-slate-800 max-w-md w-full rounded-2xl shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Account Password Recovery</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered university email. We will generate a secure 6-digit OTP code to verify your identity.
                </p>
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">University Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@campusgpt.edu"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>{resetLoading ? 'Generating OTP...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">6-Digit Verification OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="e.g. 842109"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={resetLoading || !resetOtp || !newPassword}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{resetLoading ? 'Resetting Password...' : 'Confirm New Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};