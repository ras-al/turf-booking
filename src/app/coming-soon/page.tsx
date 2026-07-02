'use client';
import { Construction, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Coming Soon</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        We're working hard to bring this feature to you. Stay tuned for updates!
      </p>
      <Link 
        href="/profile" 
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Profile
      </Link>
    </div>
  );
}
