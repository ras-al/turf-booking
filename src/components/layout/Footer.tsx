import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50">
                <span className="text-green-700 font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                PLAY<span className="text-green-600">FIELD</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Book. Play. Enjoy. Discover the best sports turfs near you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/turfs', label: 'Find Turfs' },
                { href: '/auth', label: 'Sign In' },
                { href: '/booking/history', label: 'My Bookings' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              Sports
            </h4>
            <ul className="space-y-3">
              {['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis'].map((sport) => (
                <li key={sport}>
                  <Link href={`/turfs?sport=${sport.toLowerCase()}`} className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                    {sport}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              For Owners
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth?role=owner" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Register Your Turf
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} PlayField. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
