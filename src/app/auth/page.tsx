'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile } from '@/lib/supabase/queries';
import { User, Building, AlertCircle } from 'lucide-react';

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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name || 'User', role: signupRole, phone: phone ? `+91${phone}` : null } },
        });
        if (signUpError) { setError(signUpError.message); setIsLoading(false); return; }
        if (data.user) {
          if (!data.session) { setSuccess('Account created! Please check your email to confirm.'); setMode('login'); setIsLoading(false); return; }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const profile = await fetchProfile(data.user.id);
          if (profile) { setUser(profile); router.push(signupRole === 'owner' ? '/dashboard' : redirect); }
          else { setError('Account created! Please sign in.'); setMode('login'); }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { setError(signInError.message); setIsLoading(false); return; }
        if (data.user) {
          const profile = await fetchProfile(data.user.id);
          if (profile) { setUser(profile); if (profile.role === 'admin') router.push('/admin'); else if (profile.role === 'owner') router.push('/dashboard'); else router.push(redirect); }
        }
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Something went wrong'); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50">
              <span className="text-green-700 font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900">PLAY<span className="text-green-600">FIELD</span></span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">{mode === 'login' ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        {/* Auth Card */}
        <div className="pf-card rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }} className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${mode === m ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
                {mode === m && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="p-5 space-y-4">
            <AnimatePresence mode="wait">
              {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></motion.div>)}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {success && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2"><svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><p className="text-sm text-green-700">{success}</p></motion.div>)}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div><label className="block text-xs text-gray-500 font-medium mb-1.5">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400" /></div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([{ role: 'user' as const, label: 'Player', icon: <User className="w-4 h-4" />, desc: 'Book turfs' }, { role: 'owner' as const, label: 'Turf Owner', icon: <Building className="w-4 h-4" />, desc: 'List turfs' }]).map(({ role, label, icon, desc }) => (
                        <button key={role} type="button" onClick={() => setSignupRole(role)} className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${signupRole === role ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}>{icon}<span className="text-xs font-semibold">{label}</span><span className="text-[10px] opacity-70">{desc}</span></button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div><label className="block text-xs text-gray-500 font-medium mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs text-gray-500 font-medium mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400" /></div>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Phone</label>
                  <div className="flex gap-2"><span className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-xl">+91</span><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400" /></div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</>) : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
