'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Home, Search, Calendar, User, LogIn, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // ═══════════════════════════════════════
  // Role-based navigation links
  // ═══════════════════════════════════════

  // Desktop nav links (middle section)
  const getDesktopNavLinks = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home' },
        { href: '/turfs', label: 'Find Turfs' },
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { href: '/', label: 'Home' },
          { href: '/admin', label: 'Admin Panel' },
        ];
      case 'owner':
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/dashboard', label: 'Dashboard' },
        ];
      default: // 'user'
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/booking/history', label: 'My Bookings' },
        ];
    }
  };

  // Mobile bottom nav links (max 4)
  const getMobileNavLinks = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/turfs', label: 'Find Turfs', icon: Search },
        { href: '/auth', label: 'Sign In', icon: LogIn },
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/admin', label: 'Admin', icon: Shield },
        ];
      case 'owner':
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/turfs', label: 'Turfs', icon: Search },
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ];
      default: // 'user'
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/turfs', label: 'Turfs', icon: Search },
          { href: '/booking/history', label: 'Bookings', icon: Calendar },
        ];
    }
  };

  const desktopLinks = getDesktopNavLinks();
  const mobileLinks = getMobileNavLinks();

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-pitch-900/70 backdrop-blur-2xl border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-turf flex items-center justify-center text-pitch-900 font-bold text-lg font-display transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-turf/30">
                T
              </div>
              <span className="text-xl font-display tracking-wider text-chalk">
                TURF<span className="text-turf">BOOK</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-pitch-700/40 ${
                    pathname === link.href ? 'text-turf bg-turf/10' : 'text-chalk-muted hover:text-chalk'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-turf/15 border border-turf/30 flex items-center justify-center text-turf text-sm font-semibold">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-chalk-muted leading-none">{user.full_name}</span>
                      <span className="text-[10px] text-chalk-dim capitalize">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-danger/80 hover:text-danger hover:bg-danger/10 rounded-lg border border-transparent hover:border-danger/20 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-5 py-2 text-sm font-semibold bg-turf text-pitch-900 rounded-lg hover:bg-turf-light transition-all hover:shadow-lg hover:shadow-turf/25 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 bg-pitch-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-turf/20 border-2 border-turf/30 flex items-center justify-center overflow-hidden">
            {user ? (
              <span className="text-turf font-bold text-lg">{user.full_name.charAt(0)}</span>
            ) : (
              <User className="w-5 h-5 text-turf" />
            )}
          </div>
          <div>
            <p className="text-xs text-chalk-dim font-medium">
              {user ? 'Welcome back,' : 'Hello,'}
            </p>
            <p className="text-sm font-display tracking-wide text-chalk uppercase">
              {user ? user.full_name : 'Guest Player'}
            </p>
          </div>
        </div>
        {user ? (
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-pitch-800/80 backdrop-blur-sm border border-pitch-600/50 flex items-center justify-center text-danger/70 hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/auth"
            className="w-10 h-10 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf"
          >
            <LogIn className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pitch-900/90 backdrop-blur-xl border-t border-pitch-600/50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                  isActive ? 'text-turf' : 'text-chalk-muted hover:text-chalk'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-turf/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
