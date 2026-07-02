'use client';

import { ChevronLeft, Bell, Moon, MapPin, Shield, Lock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [location, setLocation] = useState(true);
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

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

        {/* Account Security */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Security</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">Change Password</span>
              </div>
              <span className="text-xs text-gray-400">Not set</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-500">Delete Account</span>
              </div>
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
