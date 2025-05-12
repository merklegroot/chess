'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef } from 'react';

function ClientNavigation() {
  const pathname = usePathname();
  const [explodedItems, setExplodedItems] = useState<Set<string>>(new Set());
  const [explodingItems, setExplodingItems] = useState<Set<string>>(new Set());
  const clickTimers = useRef<Record<string, { count: number; timeout: NodeJS.Timeout }>>({});

  const handleClick = (path: string) => {
    if (explodedItems.has(path) || explodingItems.has(path)) return;

    const timer = clickTimers.current[path];

    if (timer) {
      clearTimeout(timer.timeout);
      timer.count++;
      
      if (timer.count >= 5) {
        setExplodingItems(prev => new Set([...prev, path]));
        setTimeout(() => {
          setExplodedItems(prev => new Set([...prev, path]));
          setExplodingItems(prev => {
            const next = new Set(prev);
            next.delete(path);
            return next;
          });
        }, 500);
        delete clickTimers.current[path];
      } else {
        timer.timeout = setTimeout(() => {
          delete clickTimers.current[path];
        }, 2000);
      }
    } else {
      clickTimers.current[path] = {
        count: 1,
        timeout: setTimeout(() => {
          delete clickTimers.current[path];
        }, 2000)
      };
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/game/list', label: 'Games' },
    { path: '/opening/list', label: 'Openings' },
    { path: '/dock', label: 'Dock' },
    { path: '/config', label: 'Config' },
    { path: '/dev', label: 'Dev' }
  ];

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {navItems.map(({ path, label }) => {
                if (explodedItems.has(path)) return null;
                
                const isActive = path === '/' 
                  ? pathname === path
                  : pathname.startsWith(path);

                return (
                  <Link 
                    key={path}
                    href={path}
                    onClick={() => handleClick(path)}
                    className={`px-3 py-2 text-sm font-medium rounded-md relative transition-transform hover:scale-105 ${
                      explodingItems.has(path) ? 'explode' : ''
                    } ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900 after:content-[""] after:absolute after:left-2 after:right-2 after:bottom-1 after:h-[2px] after:bg-gray-400' 
                        : 'text-gray-900 hover:text-gray-600'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Server component wrapper
export default function Navigation() {
  return <ClientNavigation />;
} 