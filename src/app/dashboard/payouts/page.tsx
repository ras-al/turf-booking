'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { fetchProfile } from '@/lib/supabase/queries';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Mail,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited' },
] as const;

export default function PayoutsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayAccountId, setRazorpayAccountId] = useState<string | null>(
    user?.razorpay_account_id || null
  );

  // Form state
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<string>('individual');
  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(
    (user?.phone || '').replace('+91', '')
  );
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth?redirect=/dashboard/payouts');
      return;
    }

    if (user.role !== 'owner' && user.role !== 'admin') {
      return;
    }

    // Initialize immediate state from current user in auth store
    if (user.razorpay_account_id) {
      setRazorpayAccountId(user.razorpay_account_id);
    }
    if (user.full_name) {
      setContactName((prev) => prev || user.full_name);
    }
    if (user.phone) {
      const cleanPhone = user.phone.replace('+91', '');
      if (cleanPhone) setContactPhone((prev) => prev || cleanPhone);
    }

    // Refresh profile in background to pick up any latest DB changes
    async function checkAccount() {
      try {
        const profile = await fetchProfile(user!.id);
        if (profile) {
          if (profile.razorpay_account_id) {
            setRazorpayAccountId(profile.razorpay_account_id);
          }
          if (profile.full_name) {
            setContactName((prev) => prev || profile.full_name);
          }
          if (profile.phone) {
            const clean = profile.phone.replace('+91', '');
            if (clean) setContactPhone((prev) => prev || clean);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    }

    checkAccount();
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/owners/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: user.id,
          legalBusinessName,
          businessType,
          contactName,
          contactPhone,
          street,
          city,
          state,
          postalCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link payout account');
      }

      setRazorpayAccountId(data.accountId);
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-200 max-w-md shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-sm text-gray-500 mb-6">
            You must be signed in with a turf owner account to access Payout Settings.
          </p>
          <Link
            href="/auth?redirect=/dashboard/payouts"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            Sign In with Email OTP
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'owner' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-200 max-w-md shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-sm text-gray-500 mb-6">
            Payout settings are only accessible by turf owners. You are signed in as a customer ({user.role}).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/auth?role=owner&redirect=/dashboard/payouts"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Sign as Owner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Payout Settings</h1>
            <p className="text-sm text-gray-500">Manage your Razorpay Route linked account for receiving customer bookings</p>
          </div>
        </div>

        {/* ── ALREADY LINKED STATE ── */}
        {razorpayAccountId ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-1">
                  Active
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payout account linked ✅</h2>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Razorpay Account ID</span>
                <span className="font-mono font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {razorpayAccountId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Platform Commission</span>
                <span className="font-bold text-green-600">0% (Full order transferred)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payout Hold Policy</span>
                <span className="text-gray-700 font-medium">Released at end of slot date</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">KYC Verification Required</p>
                <p className="text-blue-700 mt-0.5">
                  Check your email for a KYC link from Razorpay to activate payouts. Once KYC is verified by Razorpay, funds will settle automatically into your bank account.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                Back to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── ONBOARDING FORM ── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Set Up Razorpay Route Payouts</h2>
                <p className="text-xs text-gray-500">
                  Direct transfers with 0% platform commission straight to your linked account
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600" /> Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Legal Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={legalBusinessName}
                      onChange={(e) => setLegalBusinessName(e.target.value)}
                      placeholder="e.g. Acme Turf Arena LLP"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Business Type *
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-500"
                    >
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Primary contact person"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-xl">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="9876543210"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Registered Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street, locality, unit number"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 400001"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-xs text-gray-600">
                  Payments from players are held securely by Razorpay until the day of the match, then transferred directly to your account.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Razorpay Linked Account...
                  </>
                ) : (
                  'Link Payout Account'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
