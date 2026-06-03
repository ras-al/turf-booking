'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createTurf } from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';
import { ALL_SPORTS, ALL_AMENITIES } from '@/lib/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterTurfPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [size, setSize] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display text-chalk">ACCESS DENIED</h2>
          <p className="text-sm text-chalk-dim mt-2">Only turf owners can register turfs.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-turf hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedSports.length === 0) {
      setError('Please select at least one sport.');
      return;
    }

    if (!pricePerHour || Number(pricePerHour) <= 0) {
      setError('Please enter a valid price per hour.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createTurf({
        owner_id: user.id,
        name,
        description: description || undefined,
        address,
        city,
        sports: selectedSports,
        amenities: selectedAmenities,
        photos: photoBase64 ? [photoBase64] : [],
        size: size || undefined,
        price_per_hour: Math.round(Number(pricePerHour) * 100), // Convert INR to paise
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register turf');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 mx-auto bg-turf/20 border-2 border-turf rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-turf" />
          </motion.div>
          <h2 className="text-3xl font-display tracking-wider text-chalk">TURF REGISTERED!</h2>
          <p className="text-chalk-muted mt-2">Your turf has been submitted for review.</p>
          <div className="mt-4 bg-amber/5 border border-amber/20 rounded-xl p-4">
            <p className="text-sm text-amber">
              An admin will review and approve your turf listing. It will appear on the platform once approved.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-turf text-pitch-900 font-semibold rounded-xl text-sm hover:bg-turf-light transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-chalk-dim hover:text-chalk transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-display tracking-wider text-chalk">
            REGISTER <span className="text-turf">NEW TURF</span>
          </h1>
          <p className="text-sm text-chalk-muted mt-1">Fill in your turf details. Admin approval is required before it goes live.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 space-y-6"
        >
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Basic Information</h3>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Turf Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Green Arena Turf" className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50" />
            </div>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your turf..." rows={3} className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50 resize-none" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Location</h3>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Full Address *</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="e.g. Near Stadium, MG Road" className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50" />
            </div>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">City *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Kochi" className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50" />
            </div>
          </div>

          {/* Turf Photo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Turf Photo</h3>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Upload Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-turf file:text-pitch-900 hover:file:bg-turf-light" />
              {photoBase64 && (
                <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden border border-pitch-600">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoBase64} alt="Turf preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Sports */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Sports Available *</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_SPORTS.map((sport) => (
                <button key={sport} type="button" onClick={() => toggleSport(sport)} className={`px-3 py-2 text-xs font-medium rounded-lg border capitalize transition-all ${selectedSports.includes(sport) ? 'bg-turf/10 border-turf/40 text-turf' : 'bg-pitch-700/50 border-pitch-600 text-chalk-dim hover:border-pitch-500'}`}>
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Turf Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl focus:outline-none focus:border-turf/50">
                <option value="">Select size</option>
                <option value="5v5">5v5</option>
                <option value="7v7">7v7</option>
                <option value="11v11">11v11</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-chalk-dim font-medium mb-1.5">Price per Hour (₹) *</label>
              <input type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} required min="1" placeholder="e.g. 1500" className="w-full px-4 py-2.5 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50" />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-3 py-2 text-xs font-medium rounded-lg border capitalize transition-all ${selectedAmenities.includes(amenity) ? 'bg-turf/10 border-turf/40 text-turf' : 'bg-pitch-700/50 border-pitch-600 text-chalk-dim hover:border-pitch-500'}`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber/5 border border-amber/20 rounded-xl p-4">
            <p className="text-xs text-amber">
              ⚠️ Your turf will be submitted for admin review. It will only appear on the platform after approval.
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-cta text-pitch-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              'Submit for Approval'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
