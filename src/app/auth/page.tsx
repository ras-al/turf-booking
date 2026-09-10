'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile } from '@/lib/supabase/queries';
import { User, Building, AlertCircle, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'signup';
type SignupRole = 'user' | 'owner';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
      if (redirect && redirect !== '/') {
        router.push(redirect);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'owner') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, router, redirect]);

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>(roleParam === 'owner' ? 'owner' : 'user');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [actionLink, setActionLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const optionsData =
        mode === 'signup'
          ? {
              full_name: name.trim() || 'User',
              role: signupRole,
            }
          : undefined;

      // 1. Generate OTP via our server route
      try {
        const otpRes = await fetch('/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            mode,
            role: signupRole,
            name: name.trim() || 'User',
          }),
        });
        const otpJson = await otpRes.json();
        if (otpJson.otp) {
          setDevOtp(otpJson.otp);
        }
        if (otpJson.actionLink) {
          setActionLink(otpJson.actionLink);
        }
      } catch (err) {
        console.warn('Dev OTP route error:', err);
      }

      // 2. Also call Supabase signInWithOtp
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
          : undefined;

      await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          data: optionsData,
          emailRedirectTo: redirectUrl,
        },
      });

      setStep('otp');
      setSuccess(`Verification code sent to ${cleanEmail}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const optionsData =
        mode === 'signup'
          ? {
              full_name: name.trim() || 'User',
              role: signupRole,
            }
          : undefined;

      try {
        const otpRes = await fetch('/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            mode,
            role: signupRole,
            name: name.trim() || 'User',
          }),
        });
        const otpJson = await otpRes.json();
        if (otpJson.otp) {
          setDevOtp(otpJson.otp);
        }
        if (otpJson.actionLink) {
          setActionLink(otpJson.actionLink);
        }
      } catch (e) {
        console.warn(e);
      }

      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
          : undefined;

      await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          data: optionsData,
          emailRedirectTo: redirectUrl,
        },
      });

      setSuccess('A new verification code has been sent to your email.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = otp.trim();

      if (cleanToken.length < 6) {
        setError('Please enter the complete 6-digit code');
        setIsLoading(false);
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Wait briefly for Supabase profile triggers if newly created
        let profile = await fetchProfile(data.user.id);
        if (!profile) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          profile = await fetchProfile(data.user.id);
        }

        if (profile) {
          setUser(profile);
          if (redirect && redirect !== '/') {
            router.push(redirect);
          } else if (profile.role === 'admin') {
            router.push('/admin');
          } else if (profile.role === 'owner') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        } else {
          router.push(redirect || '/');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code or verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50">
              <span className="text-green-700 font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900">
              PLAY<span className="text-green-600">FIELD</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'otp'
              ? 'Enter the 6-digit code sent to your email'
              : mode === 'login'
              ? 'Sign in with your email address'
              : 'Create your account with email OTP'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Mode Switcher (only in step 1) */}
          {step === 'email' && (
            <div className="flex border-b border-gray-100">
              {(['login', 'signup'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                    mode === m ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                  {mode === m && (
                    <motion.div
                      layoutId="auth-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            {/* Feedback Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-4 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-3.5 mb-4 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 1: Email + Details */}
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                          I am a *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              role: 'user' as const,
                              label: 'Player',
                              icon: <User className="w-4 h-4" />,
                              desc: 'Book turfs & play',
                            },
                            {
                              role: 'owner' as const,
                              label: 'Turf Owner',
                              icon: <Building className="w-4 h-4" />,
                              desc: 'List & manage venues',
                            },
                          ].map(({ role, label, icon, desc }) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setSignupRole(role)}
                              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all ${
                                signupRole === role
                                  ? 'bg-green-50 border-green-500 text-green-700 font-bold'
                                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
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
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP code...
                    </>
                  ) : (
                    'Send Login Code'
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: Verify OTP Code */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {devOtp && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Your Verification Code
                        </span>
                        <p className="text-2xl font-mono font-extrabold text-emerald-800 tracking-widest mt-1">
                          {devOtp}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtp)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Auto Fill
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5 text-center">
                    Enter Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••••"
                      autoFocus
                      required
                      className="w-full text-center tracking-[0.4em] text-2xl font-mono font-extrabold py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl placeholder-gray-300 focus:outline-none focus:border-green-500"
                    />
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 text-center mt-2">
                    Sent to <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying code...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {actionLink && (
                  <div className="text-center">
                    <a
                      href={actionLink}
                      className="text-xs text-green-700 hover:text-green-800 font-medium underline"
                    >
                      Or click here to sign in with link →
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-green-600 hover:text-green-700 font-semibold disabled:opacity-50 flex items-center gap-1"
                  >
                    {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
