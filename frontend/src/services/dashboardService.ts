import { UserDashboardData } from '@/views/Dashboard/DashboardView';

export class DashboardService {
  /**
   * Fetch complete personalized EV dashboard payload from backend.
   */
  static async getUserDashboardData(userId?: string): Promise<UserDashboardData> {
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
          icon: () => null,
        },
        {
          id: 'dlr-up-2',
          title: 'Documents Shared',
          dealerName: 'State Subsidy Portal',
          timestamp: '2 Aug',
          status: 'Verified',
          icon: () => null,
        },
      ],
      recentActivities: [
        {
          id: 'act-1',
          activity: 'Viewed',
          vehicleName: 'Tata Curvv EV',
          timestamp: '2 hours ago',
          targetUrl: '/vehicle/tata-curvv-ev',
          icon: () => null,
        },
        {
          id: 'act-2',
          activity: 'Saved',
          vehicleName: 'MG Windsor EV',
          timestamp: 'Yesterday',
          targetUrl: '/vehicle/mg-windsor-ev',
          icon: () => null,
        },
      ],
    };
  }
}
