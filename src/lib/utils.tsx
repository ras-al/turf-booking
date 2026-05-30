// TurfBook — Utility Functions

/**
 * Format paise amount to INR display string
 */
export function formatCurrency(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/**
 * Format time string (HH:MM) to 12-hour display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date to short display (Mon, 5 Jun)
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

/**
 * Get road distance between two coordinates using OSRM
 */
export async function getRoadDistance(
  from: [number, number],
  to: [number, number]
): Promise<{ distance: number; duration: number } | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_OSRM_URL || 'https://router.project-osrm.org'}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return {
        distance: Math.round(data.routes[0].distance / 100) / 10, // km with 1 decimal
        duration: Math.round(data.routes[0].duration / 60), // minutes
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format distance display
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Generate date range from today
 */
export function getDateRange(days: number = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Generate time slots for a day (minimum 1hr)
 */
export function generateTimeSlots(
  startHour: number = 6,
  endHour: number = 24,
  intervalMinutes: number = 60
): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const endMinutes = m + intervalMinutes;
      const endH = h + Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      if (endH <= endHour) {
        const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        slots.push({ start: startTime, end: endTime });
      }
    }
  }
  return slots;
}

/**
 * Classnames utility (simple cn)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Compress and convert image file to base64
 */
export function fileToBase64(file: File, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

import React from 'react';
import {
  Trophy, Activity, MapPin, Car, Droplets, Briefcase, 
  Armchair, Wifi, Coffee, Heart, Shirt, Disc, Shield
} from 'lucide-react';

/**
 * Sport icon mapping
 */
export const SPORT_ICONS: Record<string, React.ReactNode> = {
  football: <img src="/icons/soccer-ball-variant.png" alt="football" className="w-full h-full object-contain brightness-0 invert" />,
  cricket: <img src="/icons/cricket.png" alt="cricket" className="w-full h-full object-contain brightness-0 invert" />,
  badminton: <img src="/icons/badminton.png" alt="badminton" className="w-full h-full object-contain brightness-0 invert" />,
  basketball: <img src="/icons/basketball-hoop.png" alt="basketball" className="w-full h-full object-contain brightness-0 invert" />,
  tennis: <img src="/icons/tennis.png" alt="tennis" className="w-full h-full object-contain brightness-0 invert" />,
  volleyball: <img src="/icons/vollyball.png" alt="volleyball" className="w-full h-full object-contain brightness-0 invert" />,
  hockey: <Activity className="w-full h-full" />,
  kabaddi: <Activity className="w-full h-full" />,
};

/**
 * Amenity icon mapping
 */
export const AMENITY_ICONS: Record<string, React.ReactNode> = {
  parking: <Car className="w-5 h-5" />,
  washroom: <Droplets className="w-5 h-5" />,
  'changing room': <Shirt className="w-5 h-5" />,
  floodlights: <Activity className="w-5 h-5" />,
  'drinking water': <Droplets className="w-5 h-5" />,
  cafeteria: <Coffee className="w-5 h-5" />,
  'first aid': <Heart className="w-5 h-5" />,
  'equipment rental': <Briefcase className="w-5 h-5" />,
  seating: <Armchair className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
};

/**
 * All available sports
 */
export const ALL_SPORTS = [
  'football',
  'cricket',
  'badminton',
  'basketball',
  'tennis',
  'volleyball',
  'hockey',
  'kabaddi',
];

/**
 * All available amenities
 */
export const ALL_AMENITIES = [
  'parking',
  'washroom',
  'changing room',
  'floodlights',
  'drinking water',
  'cafeteria',
  'first aid',
  'equipment rental',
  'seating',
  'wifi',
];
