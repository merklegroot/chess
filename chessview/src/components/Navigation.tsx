'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/about' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                About
              </Link>
              <Link 
                href="/game/list" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith('/game') 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Games
              </Link>
              <Link 
                href="/opening/list" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith('/opening') 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Openings
              </Link>
              <Link 
                href="/dock" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/dock' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Dock
              </Link>
              <Link 
                href="/dev" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/dev' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Dev
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 