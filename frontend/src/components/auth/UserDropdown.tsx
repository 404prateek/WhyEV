'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LayoutDashboard,
  Heart,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { ROUTES } from '@/routes/routes';

export function UserDropdown() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!user) return null;

  const firstName = user.name.split(' ')[0] || 'User';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/');
  };

  const menuItems = [
    { label: 'My Profile', href: ROUTES.PROFILE, icon: User },
    { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Saved EVs', href: `${ROUTES.PROFILE}?tab=saved-evs`, icon: Heart },
    { label: 'Saved Subsidy Reports', href: `${ROUTES.PROFILE}?tab=saved-reports`, icon: FileText },
    { label: 'Account Settings', href: `${ROUTES.PROFILE}?tab=settings`, icon: Settings },
    { label: 'Help & Support', href: `${ROUTES.PROFILE}?tab=help`, icon: HelpCircle },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger: Circular Profile Picture + First Name Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-xs font-semibold transition-all cursor-pointer focus:outline-none hover:scale-[1.02] active:scale-98"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
          {getInitials(user.name)}
        </div>
        <span className="font-bold text-slate-900">{firstName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 text-slate-900"
          >
            {/* User Info Header: Full Name at top */}
            <div className="px-3 py-2.5 border-b border-slate-100 space-y-1">
              <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between gap-1.5">
                <span className="truncate">{user.name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-500 truncate font-normal">{user.email}</div>
              <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                <span>Delhi Resident</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Option */}
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left group"
              >
                <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
