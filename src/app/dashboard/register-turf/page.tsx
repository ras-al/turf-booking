'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createTurf } from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';
import { ALL_SPORTS, ALL_AMENITIES } from '@/lib/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

async function uploadToCloudinary(file: File): Promise<string> {
  // Get signed upload params from our API
  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: 'playfield/turfs' }),
  });

  if (!signRes.ok) {
    throw new Error('Failed to get upload signature');
  }

  const { signature, timestamp, api_key, cloud_name, folder } = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', api_key);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error('Image upload failed');
  }

  const data = await uploadRes.json();
  return data.secure_url;
}

interface UploadingPhoto {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

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
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [slotDuration, setSlotDuration] = useState('60');
  const [photos, setPhotos] = useState<UploadingPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-2">Only turf owners can register turfs.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-green-600 hover:underline">Go Home</Link>
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos: UploadingPhoto[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);

    // Upload each file
    for (let i = 0; i < newPhotos.length; i++) {
      try {
        const url = await uploadToCloudinary(newPhotos[i].file);
        setPhotos(prev => prev.map(p =>
          p.preview === newPhotos[i].preview ? { ...p, url, uploading: false } : p
        ));
      } catch {
        setPhotos(prev => prev.map(p =>
          p.preview === newPhotos[i].preview ? { ...p, uploading: false, error: 'Upload failed' } : p
        ));
      }
    }

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (preview: string) => {
    setPhotos(prev => prev.filter(p => p.preview !== preview));
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

    // Check if any photos are still uploading
    if (photos.some(p => p.uploading)) {
      setError('Please wait for all photos to finish uploading.');
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrls = photos.filter(p => p.url).map(p => p.url!);
      await createTurf({
        owner_id: user.id,
        name,
        description: description || undefined,
        address,
        city,
        sports: selectedSports,
        amenities: selectedAmenities,
        photos: photoUrls,
        size: size || undefined,
        price_per_hour: Math.round(Number(pricePerHour) * 100), // Convert INR to paise
        opening_time: openingTime,
        closing_time: closingTime,
        slot_duration_minutes: Number(slotDuration),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register turf');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full text-center pf-card p-10 rounded-3xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 mx-auto bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900">Turf Registered!</h2>
          <p className="text-gray-500 mt-2">Your turf has been submitted for review.</p>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700 font-semibold">
              An admin will review and approve your turf listing. Slots will be auto-generated once approved.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors shadow-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Register New Turf
          </h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your turf details. Admin approval is required before it goes live.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="pf-card rounded-2xl p-6 md:p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Basic Information</h3>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Turf Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Green Arena Turf" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your turf..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-t border-gray-100 pt-6">Location</h3>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Full Address *</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="e.g. Near Stadium, MG Road" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">City *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Kochi" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
            </div>
          </div>

          {/* Turf Photos — Multi-file Cloudinary Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-t border-gray-100 pt-6">Turf Photos</h3>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Upload Images (up to 5)</label>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {photos.map((photo) => (
                    <div key={photo.preview} className="relative h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url || photo.preview} alt="Turf preview" className="w-full h-full object-cover" />
                      {photo.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                      {photo.error && (
                        <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.preview)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length < 5 && (
                <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Click to upload photos</span>
                </label>
              )}
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {photos.length}/5 photos uploaded. JPG, PNG, WebP supported.
              </p>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-t border-gray-100 pt-6">Operating Hours</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1.5">Opens At</label>
                <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1.5">Closes At</label>
                <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1.5">Slot Duration</label>
                <select value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400">
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sports */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-t border-gray-100 pt-6">Sports Available *</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_SPORTS.map((sport) => (
                <button key={sport} type="button" onClick={() => toggleSport(sport)} className={`px-4 py-2.5 text-xs font-bold rounded-xl border capitalize transition-all ${selectedSports.includes(sport) ? 'bg-green-100 border-green-300 text-green-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'}`}>
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Price */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Turf Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400">
                <option value="">Select size</option>
                <option value="5v5">5v5</option>
                <option value="7v7">7v7</option>
                <option value="11v11">11v11</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1.5">Price per Hour (₹) *</label>
              <input type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} required min="1" placeholder="e.g. 1500" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-t border-gray-100 pt-6">Amenities</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_AMENITIES.map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-4 py-2.5 text-xs font-bold rounded-xl border capitalize transition-all ${selectedAmenities.includes(amenity) ? 'bg-green-100 border-green-300 text-green-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'}`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-amber-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Your turf will be submitted for admin review. Slots will be auto-generated once approved based on your operating hours.
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              'Submit for Approval'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
