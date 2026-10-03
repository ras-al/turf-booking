import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileInstallPrompt from '@/components/ui/MobileInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'KiKKO - FIND. BOOK. PLAY.',
  description:
    'Discover, filter, and book the best sports turfs near you in real-time. KiKKO - FIND. BOOK. PLAY. Football, Cricket, Badminton & more!',
  keywords: ['KiKKO', 'FIND. BOOK. PLAY.', 'turf booking', 'sports turf', 'football turf', 'cricket ground', 'badminton court', 'book turf online'],
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'KiKKO - FIND. BOOK. PLAY.',
    description: 'Discover, filter, and book the best sports turfs near you in real-time. KiKKO - FIND. BOOK. PLAY.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-14 pb-20 md:pt-16 md:pb-0">{children}</main>
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileInstallPrompt />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
