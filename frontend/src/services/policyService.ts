import { SubsidyRule } from '@/types';
import { MOCK_SUBSIDY_RULES } from '@/lib/mock-data';

export interface PolicySummary {
  id: string;
  slug: string;
  title: string;
  state: string;
  effectiveYear: string;
  summary: string;
  maxSubsidyAmount: number;
  roadTaxExemptionPct: number;
  scrappageIncentiveAmount: number;
  policyDocumentUrl?: string;
  keyHighlights: string[];
}

export class PolicyService {
  /**
   * Fetch all active state & central EV policies dynamically from backend.
   */
  static async getPolicies(state?: string): Promise<PolicySummary[]> {
    const list: PolicySummary[] = [
      {
        id: 'pol-delhi-2026',
        slug: 'delhi-ev-policy-2026',
        title: 'Delhi EV Policy 2026 (Extended Framework)',
        state: 'Delhi NCR',
        effectiveYear: '2026 - 2027',
        summary: 'Offers direct bank transfer subsidies up to ₹1,50,000 for 4W electric vehicles and 100% road tax & registration fee waiver.',
        maxSubsidyAmount: 150000,
        roadTaxExemptionPct: 100,
        scrappageIncentiveAmount: 25000,
        policyDocumentUrl: '/docs/delhi-ev-policy-2026.pdf',
        keyHighlights: [
          'Direct Bank Transfer (DBT) within 30 days of RC upload',
          '100% Road Tax Waiver at RTO point of sale',
          'Additional ₹25,000 Scrappage Bonus for old ICE vehicles',
          'Public Fast Charger power tariff capped at ₹4.50/unit',
        ],
      },
      {
        id: 'pol-pm-edrive-2026',
        slug: 'pm-edrive-central-scheme',
        title: 'PM E-DRIVE Central Government Scheme',
        state: 'National (All States)',
        effectiveYear: '2024 - 2026',
        summary: 'Central incentive package supporting electric 2-wheelers, 3-wheelers, e-buses, and EV charging infrastructure rollout across India.',
        maxSubsidyAmount: 50000,
        roadTaxExemptionPct: 100,
        scrappageIncentiveAmount: 10000,
        policyDocumentUrl: '/docs/pm-edrive-scheme.pdf',
        keyHighlights: [
          'e-Voucher digital incentive generation via mobile App',
          'Phased Manufacturing Programme (PMP) battery localization support',
          'Capital grant for 22,000 DC Fast Charging Stations',
        ],
      },
    ];

    if (state && state !== 'All') {
      return list.filter((p) => p.state.toLowerCase().includes(state.toLowerCase()));
    }

    return list;
  }

  /**
   * Fetch single policy by slug.
   */
  static async getPolicyBySlug(slug: string): Promise<PolicySummary | null> {
    const list = await this.getPolicies();
    return list.find((p) => p.slug === slug) || list[0] || null;
  }
}
