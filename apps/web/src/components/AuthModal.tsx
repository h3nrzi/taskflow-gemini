'use client';

import React, { useState } from 'react';
import { RegisterInput, LoginInput, UserProfile } from '@shared/schemas/index';
import { registerUser, loginUser, setAuthToken } from '../lib/api';
import { KeyRound, UserPlus, LogIn, X, Shield, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const payload: RegisterInput = { email, password, name };
        const response = await registerUser(payload);
        onAuthSuccess(response.user, response.token);
      } else {
        const payload: LoginInput = { email, password };
        const response = await loginUser(payload);
        onAuthSuccess(response.user, response.token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121826] border border-[#1f293d] w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="space-y-5 text-center">
            <div className="bg-blue-950/60 p-3 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-blue-800/60 text-blue-400">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>

            <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold text-blue-400">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workspace:</span>
                <span className="font-mono text-slate-300">{currentUser.workspaceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-slate-400">{currentUser.id.slice(0, 8)}...</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <KeyRound className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-lg text-slate-100">
                {mode === 'login' ? 'User Login' : 'Register Account'}
              </h3>
            </div>

            {error && (
              <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-xl text-xs text-rose-200 leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Engineer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@taskflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {loading
                  ? mode === 'login'
                    ? 'Authenticating...'
                    : 'Registering...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Register
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
