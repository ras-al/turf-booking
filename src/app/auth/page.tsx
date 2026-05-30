'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_USER, MOCK_OWNER } from '@/lib/mock-data';
import { User, Building, Shield, LogIn } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pitch-900" />}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const roleParam = searchParams.get('role');
  const { setUser } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo: log in as user or owner based on role param
    if (roleParam === 'owner') {
      setUser({ ...MOCK_OWNER, full_name: name || MOCK_OWNER.full_name, email: email || MOCK_OWNER.email });
    } else {
      setUser({ ...MOCK_USER, full_name: name || MOCK_USER.full_name, email: email || MOCK_USER.email });
    }

    setIsLoading(false);
    router.push(redirect);
  };

  const handleDemoLogin = (role: 'user' | 'owner' | 'admin') => {
    const profiles = {
      user: MOCK_USER,
      owner: MOCK_OWNER,
      admin: { ...MOCK_USER, id: 'admin-001', role: 'admin' as const, full_name: 'Admin User', email: 'admin@turfbook.in' },
    };
    setUser(profiles[role]);
    router.push(role === 'admin' ? '/admin' : role === 'owner' ? '/dashboard' : redirect);
  };

  return (
    <div className="min-h-screen bg-pitch-900 flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-turf/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-turf flex items-center justify-center text-pitch-900 font-bold text-xl font-display">
              T
            </div>
            <span className="text-2xl font-display tracking-wider text-chalk">
              TURF<span className="text-turf">BOOK</span>
            </span>
          </Link>
          <p className="text-sm text-chalk-dim mt-2">
            {mode === 'login' ? 'Welcome back, player!' : 'Join the game today'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab toggle */}
          <div className="flex border-b border-pitch-600/30">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  mode === m ? 'text-turf' : 'text-chalk-dim hover:text-chalk'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-turf"
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-chalk-dim font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50"
              />
            </div>

            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50"
              />
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-chalk-dim font-medium mb-1.5">Phone</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk-dim text-sm rounded-xl">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-turf text-pitch-900 font-semibold rounded-xl hover:bg-turf-light transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Login */}
        <div className="mt-8 glass-panel rounded-2xl p-6">
          <h4 className="text-xs text-chalk-dim uppercase tracking-widest font-semibold mb-3 text-center">
            Quick Demo Login
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'user' as const, label: 'Player', icon: <User className="w-4 h-4" />, color: 'turf' },
              { role: 'owner' as const, label: 'Owner', icon: <Building className="w-4 h-4" />, color: 'amber' },
              { role: 'admin' as const, label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'chalk' },
            ].map(({ role, label, icon, color }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                className={`flex flex-col items-center gap-1.5 py-3 text-xs font-medium rounded-xl border transition-all hover:-translate-y-0.5 ${
                  color === 'turf'
                    ? 'bg-turf/10 border-turf/30 text-turf hover:bg-turf/20'
                    : color === 'amber'
                    ? 'bg-amber/10 border-amber/30 text-amber hover:bg-amber/20'
                    : 'bg-pitch-700/50 border-pitch-500/30 text-chalk hover:bg-pitch-600/50'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
