'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sliders, FileCheck, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Matcher', href: '/recommend', icon: Sliders },
    { label: 'Subsidy', href: '/subsidy', icon: FileCheck, isUsp: true },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-emerald-900/30 px-2 py-2 shadow-2xl">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative',
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'text-emerald-400 scale-110 transition-transform')} />
                {item.isUsp && (
                  <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
