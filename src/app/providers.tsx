'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeProvider } from 'next-themes';

function AuthInitializer({ children }: { children: ReactNode }) {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50 animate-pulse">
            <span className="text-green-700 font-bold text-lg">P</span>
          </div>
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
