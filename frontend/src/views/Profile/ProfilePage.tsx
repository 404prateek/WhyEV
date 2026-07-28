'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileSidebar, ProfileTab } from '@/components/sidebar/ProfileSidebar';
import { ProfileOverview } from '@/components/profile/ProfileOverview';
import { SavedEvs } from '@/components/profile/SavedEvs';
import { SavedSubsidyReports } from '@/components/profile/SavedSubsidyReports';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { HelpSupport } from '@/components/profile/HelpSupport';
import { useProfile } from '@/hooks/useProfile';

export function ProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ProfileTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  const {
    user,
    savedVehicles,
    savedReports,
    updateUserProfile,
    removeSavedVehicle,
    removeSavedReport,
  } = useProfile();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as ProfileTab;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="w-full bg-slate-50/50 min-h-[calc(100vh-140px)] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Profile Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Manage your personal details, saved EVs, Delhi 2026 subsidy reports, and preferences.
            </p>
          </div>

          {/* Workspace Layout: Sidebar + Main Content */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Dynamic Main Content Panel */}
            <div className="flex-1 w-full min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {activeTab === 'overview' && (
                    <ProfileOverview
                      user={user}
                      savedVehiclesCount={savedVehicles.length}
                      savedReportsCount={savedReports.length}
                      onEditProfile={() => setActiveTab('settings')}
                    />
                  )}

                  {activeTab === 'saved-evs' && (
                    <SavedEvs vehicles={savedVehicles} onRemove={removeSavedVehicle} />
                  )}

                  {activeTab === 'saved-reports' && (
                    <SavedSubsidyReports reports={savedReports} onRemove={removeSavedReport} />
                  )}

                  {activeTab === 'settings' && (
                    <AccountSettings user={user} onUpdate={updateUserProfile} />
                  )}

                  {activeTab === 'help' && <HelpSupport />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
