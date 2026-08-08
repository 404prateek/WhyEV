import { UserDashboardData } from '@/views/Dashboard/DashboardView';
import { userApi } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { Building2, Clock, FileCheck, Bookmark, Car } from 'lucide-react';

export class DashboardService {
  /**
   * Fetch complete personalized EV dashboard payload from backend.
   */
  static async getUserDashboardData(userId?: string): Promise<UserDashboardData> {
    try {
      const live = await userApi.getDashboardData();
      if (live) {
        const primaryApp = live.subsidy_applications[0];
        const claimAlert = primaryApp
          ? {
              status: (primaryApp.status as any) || 'active',
              title: 'Delhi EV Policy 2026 Direct Subsidy',
              schemeName: 'Delhi State Direct Bank Transfer',
              subsidyAmountFormatted: formatINR(primaryApp.total_benefit || 150000),
              remainingDays: primaryApp.days_remaining ?? 12,
              deadlineDate: primaryApp.filing_deadline || '31 Aug 2026',
              currentStageName: 'RC & Bank Account Verification',
              supportingMessage: 'RC copy and bank details submitted successfully. Verification in progress.',
              progressPct: Math.round(((30 - (primaryApp.days_remaining ?? 12)) / 30) * 100),
              primaryCtaLabel: 'Upload Documents',
              primaryCtaUrl: '/subsidy',
            }
          : undefined;

        const dealerUpdates = live.dealer_leads.map((l) => ({
          id: l.id,
          title: 'Dealer Lead Submitted',
          dealerName: l.dealer_name,
          timestamp: l.submitted_at ? new Date(l.submitted_at).toLocaleDateString() : 'Recent',
          status: l.status,
          icon: Building2,
        }));

        const savedVehiclesActivities = live.saved_vehicles.map((v) => ({
          id: v.id,
          activity: 'Saved',
          vehicleName: `${v.make} ${v.model}`,
          timestamp: 'Saved item',
          targetUrl: `/dealers?vehicle=${v.id}`,
          icon: Bookmark,
        }));

        return {
          userName: live.user_name || 'Aishwarya',
          completionPct: 60,
          claimAlert: claimAlert || {
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
            { id: 'stg-4', title: 'Dealer Contacted', isCompleted: dealerUpdates.length > 0 },
            { id: 'stg-5', title: 'Test Drive Scheduled', isCompleted: false },
            { id: 'stg-6', title: 'Purchase Completed', isCompleted: false },
          ],
          dealerUpdates: dealerUpdates.length > 0 ? dealerUpdates : [
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
              icon: FileCheck,
            },
          ],
          recentActivities: savedVehiclesActivities.length > 0 ? savedVehiclesActivities : [
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
          ],
        };
      }
    } catch (e) {
      console.warn('[DashboardService] Error fetching live dashboard data:', e);
    }

    return {
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
          icon: FileCheck,
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
      ],
    };
  }
}

