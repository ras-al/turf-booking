'use client';

import { ChevronLeft, Bell, Moon, MapPin, Shield, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { updateProfile } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, setUser, isLoading: authLoading, logout } = useAuthStore();
  const router = useRouter();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [location, setLocation] = useState(true);
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Profile edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/settings');
    }
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const isDark = mounted && theme === 'dark';

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateProfile(user.id, {
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading) {
    return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center px-4 h-14 md:h-16 max-w-2xl mx-auto">
          <Link href="/profile" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">

        {/* Profile Edit */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Profile</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Full Name</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Phone Number</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : saveSuccess ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </section>
        
        {/* App Preferences */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">App Preferences</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Push Notifications</h3>
                  <p className="text-xs text-gray-500">Booking updates and reminders</p>
                </div>
              </div>
              <Toggle checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
            </div>
            
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Email Notifications</h3>
                  <p className="text-xs text-gray-500">Promotions and newsletters</p>
                </div>
              </div>
              <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
            </div>
            
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Dark Mode</h3>
                  <p className="text-xs text-gray-500">Toggle dark theme</p>
                </div>
              </div>
              <Toggle checked={isDark} onChange={() => setTheme(isDark ? 'light' : 'dark')} />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Location Access</h3>
                  <p className="text-xs text-gray-500">For finding nearby turfs</p>
                </div>
              </div>
              <Toggle checked={location} onChange={() => setLocation(!location)} />
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Account</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left"
            >
              <span className="text-sm font-semibold text-red-500">Logout</span>
            </button>
          </div>
        </section>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          PlayField v1.0.0 (Production)
        </p>

      </div>
    </div>
  );
}
