'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sliders, FileCheck, MapPin, LayoutDashboard, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Recommend', href: '/recommend', icon: Sliders },
    { label: 'Subsidy', href: '/subsidy', icon: FileCheck, isUsp: true },
    { label: 'Map', href: '/map', icon: MapPin },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 px-1 py-1.5 shadow-2xl shadow-slate-950/10">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div key={item.href} whileTap={{ scale: 0.90 }}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl min-h-[48px] transition-all relative cursor-pointer select-none',
                  isActive
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isActive ? 'text-emerald-600 scale-110' : 'text-slate-500'
                    )}
                  />
                  {item.isUsp && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-emerald-600 shadow-sm"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
