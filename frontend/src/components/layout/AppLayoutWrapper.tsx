'use client';

import React from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AiAgentDrawer } from '@/components/common/AiAgentDrawer';
import { AuthModal } from '@/components/common/AuthModal';
import { PermissionModal } from '@/components/common/PermissionModal';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-emerald-600 selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full pt-16 sm:pt-20 pb-20 lg:pb-0">{children}</main>
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Drawers & Modals */}
      <AiAgentDrawer />
      <AuthModal />
      <PermissionModal />
    </div>
  );
}
