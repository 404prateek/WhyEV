'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Zap, Newspaper, BatteryCharging } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/routes';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: ROUTES.HOME, icon: Home },
    { label: 'Shop', href: ROUTES.RECOMMEND, icon: Sparkles },
    { label: 'Map', href: ROUTES.MAP, icon: Zap },
    { label: 'Discover', href: ROUTES.LIVE_FEED, icon: Newspaper, isUsp: true },
    { label: 'Battery', href: ROUTES.BATTERY_HEALTH, icon: BatteryCharging },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 px-0.5 sm:px-1 py-1 shadow-2xl shadow-slate-950/10">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div key={item.href} whileTap={{ scale: 0.90 }} className="flex-1 min-w-0">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1 px-1 sm:px-2 rounded-2xl min-h-[46px] transition-all relative cursor-pointer select-none text-center',
                  isActive
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      'w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200',
                      isActive ? 'text-emerald-600 scale-110' : 'text-slate-500'
                    )}
                  />
                  {item.isUsp && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <span className="text-[9px] xs:text-[10px] tracking-tight truncate max-w-[58px] block">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-0.5 w-4 sm:w-5 h-1 rounded-full bg-emerald-600 shadow-sm"
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
