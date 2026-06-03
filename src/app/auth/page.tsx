'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile } from '@/lib/supabase/queries';
import { User, Building, LogIn, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';
type SignupRole = 'user' | 'owner';

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
  const roleParam = searchParams.get('role') as SignupRole | null;
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/dashboard');
      else router.push(redirect);
    }
  }, [user, router, redirect]);

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>(roleParam === 'owner' ? 'owner' : 'user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'User',
              role: signupRole,
              phone: phone ? `+91${phone}` : null,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          if (!data.session) {
            // Email confirmation is required
            setSuccess('Account created! Please check your email to confirm your account.');
            setMode('login');
            setIsLoading(false);
            return;
          }

          // Wait a moment for the trigger to create the profile
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const profile = await fetchProfile(data.user.id);
          if (profile) {
            setUser(profile);
            router.push(signupRole === 'owner' ? '/dashboard' : redirect);
          } else {
            setError('Account created! Please sign in.');
            setMode('login');
          }
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const profile = await fetchProfile(data.user.id);
          if (profile) {
            setUser(profile);
            // Redirect based on role
            if (profile.role === 'admin') {
              router.push('/admin');
            } else if (profile.role === 'owner') {
              router.push('/dashboard');
            } else {
              router.push(redirect);
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }

    setIsLoading(false);
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
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
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
            {/* Error display */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-danger/10 border border-danger/30 rounded-xl p-3 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success display */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-turf/10 border border-turf/30 rounded-xl p-3 flex items-start gap-2"
                >
                  <svg className="w-4 h-4 text-turf shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-turf">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs text-chalk-dim font-medium mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50"
                    />
                  </div>

                  {/* Role selector */}
                  <div>
                    <label className="block text-xs text-chalk-dim font-medium mb-1.5">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { role: 'user' as const, label: 'Player', icon: <User className="w-4 h-4" />, desc: 'Book turfs' },
                        { role: 'owner' as const, label: 'Turf Owner', icon: <Building className="w-4 h-4" />, desc: 'List turfs' },
                      ]).map(({ role, label, icon, desc }) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSignupRole(role)}
                          className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                            signupRole === role
                              ? 'bg-turf/10 border-turf/40 text-turf'
                              : 'bg-pitch-700/50 border-pitch-600 text-chalk-dim hover:border-pitch-500'
                          }`}
                        >
                          {icon}
                          <span className="text-xs font-semibold">{label}</span>
                          <span className="text-[10px] opacity-70">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                required
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
                required
                minLength={6}
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
      </motion.div>
    </div>
  );
}
