import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onContinueGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateRegister,
  onContinueGuest,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCitizenLogin = () => {
    setEmail('citizen@demo.in');
    setPassword('demo123');
  };

  const handleDemoAdminLogin = () => {
    setEmail('admin@healthcare.gov.in');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to ArogyaNav</h1>
        <p className="text-xs text-slate-500">
          Access your saved schemes, check previous eligibility history, and update medical preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="citizen@demo.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCitizenLogin}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold text-center transition-colors"
            >
              Demo Citizen
            </button>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold text-center transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Continue as Guest Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onContinueGuest}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue as Guest (No Registration Needed)</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-bold text-emerald-700 hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
