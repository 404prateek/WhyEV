'use client';

import React from 'react';
import { User, Heart, FileText, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export type ProfileTab = 'overview' | 'saved-evs' | 'saved-reports' | 'settings' | 'help';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'saved-evs', label: 'Saved EVs', icon: Heart },
    { id: 'saved-reports', label: 'Saved Subsidy Reports', icon: FileText },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm h-fit space-y-4">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          User Account
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="md:hidden w-full overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 w-max px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
