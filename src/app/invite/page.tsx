'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvitePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/turfs');
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
