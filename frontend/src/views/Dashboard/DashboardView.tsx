'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  FileText,
  Clock,
  Car,
  Bookmark,
  Scale,
  Sparkles,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { JourneyProgressTracker } from '@/components/dashboard/JourneyProgressTracker';
import { DealerUpdatesTimeline } from '@/components/dashboard/DealerUpdatesTimeline';
import { RecentActivityTimeline } from '@/components/dashboard/RecentActivityTimeline';
import { ClaimAlertCard, ClaimAlertData } from '@/components/dashboard/ClaimAlertCard';

export interface JourneyStage {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface DealerUpdateItem {
  id: string;
  title: string;
  dealerName?: string;
  timestamp: string;
  status: string;
  icon: React.ElementType;
}

export interface RecentActivityItem {
  id: string;
  activity: string;
  vehicleName?: string;
  timestamp: string;
  targetUrl: string;
  icon: React.ElementType;
}

export interface UserDashboardData {
  userName: string;
  claimAlert?: ClaimAlertData;
  journeyStages: JourneyStage[];
  completionPct: number;
  dealerUpdates: DealerUpdateItem[];
  recentActivities: RecentActivityItem[];
}

const MOCK_DASHBOARD_DATA: UserDashboardData = {
  userName: 'Aishwarya',
  completionPct: 50,
  claimAlert: {
    status: 'active',
    title: 'Delhi EV Policy 2026 Direct Subsidy',
    schemeName: 'Delhi State Direct Bank Transfer',
    subsidyAmountFormatted: '₹1,50,000',
    remainingDays: 12,
    deadlineDate: '31 Aug 2026',
    currentStageName: 'RC & Bank Account Verification',
    supportingMessage: 'RC copy and bank details submitted successfully. Verification in progress.',
    progressPct: 60,
    primaryCtaLabel: 'Upload Documents',
    primaryCtaUrl: '/subsidy',
  },
  journeyStages: [
    { id: 'stg-1', title: 'Questionnaire Completed', isCompleted: true, completedAt: 'Aug 1' },
    { id: 'stg-2', title: 'Recommendations Generated', isCompleted: true, completedAt: 'Aug 1' },
    { id: 'stg-3', title: 'Vehicle Saved', isCompleted: true, completedAt: 'Aug 2' },
    { id: 'stg-4', title: 'Dealer Contacted', isCompleted: false },
    { id: 'stg-5', title: 'Test Drive Scheduled', isCompleted: false },
    { id: 'stg-6', title: 'Purchase Completed', isCompleted: false },
  ],
  dealerUpdates: [
    {
      id: 'dlr-up-1',
      title: 'Dealer Contacted',
      dealerName: 'Pragati Tata EV Showroom',
      timestamp: 'Yesterday',
      status: 'In Progress',
      icon: Building2,
    },
    {
      id: 'dlr-up-2',
      title: 'Documents Shared',
      dealerName: 'State Subsidy Portal',
      timestamp: '2 Aug',
      status: 'Verified',
      icon: FileText,
    },
    {
      id: 'dlr-up-3',
      title: 'Test Drive Scheduled',
      dealerName: 'Flagship MG EV Experience Centre',
      timestamp: '12 Aug • 11:00 AM',
      status: 'Confirmed',
      icon: Calendar,
    },
    {
      id: 'dlr-up-4',
      title: 'Awaiting Dealer Response',
      dealerName: 'Ather Space Experience Centre',
      timestamp: 'In Progress',
      status: 'Pending',
      icon: Clock,
    },
  ],
  recentActivities: [
    {
      id: 'act-1',
      activity: 'Viewed',
      vehicleName: 'Tata Curvv EV',
      timestamp: '2 hours ago',
      targetUrl: '/vehicle/tata-curvv-ev',
      icon: Car,
    },
    {
      id: 'act-2',
      activity: 'Saved',
      vehicleName: 'MG Windsor EV',
      timestamp: 'Yesterday',
      targetUrl: '/vehicle/mg-windsor-ev',
      icon: Bookmark,
    },
    {
      id: 'act-3',
      activity: 'Compared',
      vehicleName: 'Hyundai Creta Electric with Tata Curvv EV',
      timestamp: '3 days ago',
      targetUrl: '/recommend?flow=compare',
      icon: Scale,
    },
    {
      id: 'act-4',
      activity: 'Completed',
      vehicleName: 'Personalized EV Matcher',
      timestamp: '4 days ago',
      targetUrl: '/recommend?flow=recommend',
      icon: Sparkles,
    },
    {
      id: 'act-5',
      activity: 'Calculated',
      vehicleName: 'State Subsidy Benefits',
      timestamp: '5 days ago',
      targetUrl: '/subsidy',
      icon: Landmark,
    },
  ],
};

export function DashboardView() {
  const { user } = useAuth();
  const [data] = useState<UserDashboardData>(MOCK_DASHBOARD_DATA);

  const displayName = (user as any)?.name || (user as any)?.fullName || data.userName;

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Section 1: Hero Section */}
        <DashboardHero displayName={displayName} />

        {/* Section 2: Dynamic Data-Driven Claim Alert Card */}
        <ClaimAlertCard claimData={data.claimAlert} />

        {/* Section 3: EV Journey Progress */}
        <JourneyProgressTracker stages={data.journeyStages} completionPct={data.completionPct} />

        {/* Section 4 & 5: Responsive Grid for Dealer Updates & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <DealerUpdatesTimeline updates={data.dealerUpdates} />
          <RecentActivityTimeline activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
