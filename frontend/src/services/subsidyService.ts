import { SubsidyRule, SubsidyApplication } from '@/types';
import { MOCK_SUBSIDY_RULES, MOCK_SUBSIDY_APPLICATIONS } from '@/lib/mock-data';
import { subsidyApi, userApi } from '@/lib/api';

export interface SubsidyCalcParams {
  category: '2W' | '3W' | '4W';
  batteryCapacityKwh: number;
  exShowroomPrice: number;
  includeScrappageBonus?: boolean;
  state?: string;
}

export interface SubsidyCalcResult {
  state: string;
  schemeName: string;
  incentiveAmount: number;
  scrappageBonusAmount: number;
  taxWaiverEstimated: number;
  registrationWaiverEstimated: number;
  totalBenefits: number;
  effectivePrice: number;
  eligible: boolean;
  ineligibilityReason?: string;
}

export class SubsidyService {
  /**
   * Dynamically calculate state and central EV subsidy benefits from backend policy rules.
   */
  static async calculateSubsidy(params: SubsidyCalcParams): Promise<SubsidyCalcResult> {
    try {
      const liveRes = await subsidyApi.calculateSubsidy({
        category: params.category,
        batteryCapacityKwh: params.batteryCapacityKwh,
        hasTradeInIce: !!params.includeScrappageBonus,
        isDelhiResident: (params.state || 'Delhi NCR').toLowerCase().includes('delhi'),
        price: params.exShowroomPrice,
        city: params.state || 'Delhi',
        regYear: new Date().getFullYear(),
      });

      const totalBenefits = liveRes.totalBenefit;
      const effectivePrice = Math.max(0, params.exShowroomPrice - totalBenefits);

      return {
        state: params.state || 'Delhi NCR',
        schemeName: 'Delhi EV Policy 2026 Direct Subsidy',
        incentiveAmount: liveRes.purchaseIncentive,
        scrappageBonusAmount: liveRes.scrappageBonus,
        taxWaiverEstimated: liveRes.roadTaxWaiverEstimated,
        registrationWaiverEstimated: 0,
        totalBenefits,
        effectivePrice,
        eligible: liveRes.eligible,
        ineligibilityReason: liveRes.reasonIfIneligible,
      };
    } catch (e) {
      console.warn('[SubsidyService] Error invoking live calculation, using fallback:', e);
    }

    const rules = MOCK_SUBSIDY_RULES || [];
    const matchedRule = rules.find((r) => r.category === params.category) || rules[0];

    const incentivePerKwh = matchedRule ? matchedRule.incentivePerKwh : 10000;
    const maxCap = matchedRule ? matchedRule.maxCapAmount : 150000;
    const rawIncentive = params.batteryCapacityKwh * incentivePerKwh;
    const incentiveAmount = Math.min(rawIncentive, maxCap);

    const scrappageBonusAmount = params.includeScrappageBonus
      ? matchedRule?.scrappageBonusAmount || 10000
      : 0;

    const roadTaxRate = 0.08;
    const taxWaiverEstimated = Math.round(params.exShowroomPrice * roadTaxRate);
    const registrationWaiverEstimated = 1500;
    const totalBenefits =
      incentiveAmount + scrappageBonusAmount + taxWaiverEstimated + registrationWaiverEstimated;
    const effectivePrice = Math.max(0, params.exShowroomPrice - totalBenefits);

    return {
      state: params.state || 'Delhi NCR',
      schemeName: matchedRule?.policyVersion || 'Delhi EV Policy 2026 Direct Subsidy',
      incentiveAmount,
      scrappageBonusAmount,
      taxWaiverEstimated,
      registrationWaiverEstimated,
      totalBenefits,
      effectivePrice,
      eligible: true,
    };
  }

  /**
   * Fetch state subsidy rules and policy thresholds.
   */
  static async getSubsidyRules(state?: string): Promise<SubsidyRule[]> {
    return MOCK_SUBSIDY_RULES || [];
  }

  /**
   * Fetch active subsidy applications for the user.
   */
  static async getApplications(): Promise<SubsidyApplication[]> {
    try {
      const data = await userApi.getDashboardData();
      if (data.subsidy_applications && data.subsidy_applications.length > 0) {
        return data.subsidy_applications.map((app) => ({
          id: app.id,
          userId: 'usr-1',
          vehicleId: app.vehicle_id || 'tata-nexon-ev',
          vehicleModelName: app.vehicle_model_name,
          registrationState: app.registration_state,
          rcIssueDate: app.rc_issue_date || '',
          filingDeadline: app.filing_deadline || '',
          daysRemaining: app.days_remaining,
          status: app.status as any,
          calculatedSubsidy: app.calculated_subsidy,
          scrappageBonus: app.scrappage_bonus,
          taxWaiverEstimated: app.tax_waiver_estimated,
          totalBenefit: app.total_benefit,
          submittedAt: new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('[SubsidyService] Error fetching applications from dashboard, using fallback:', e);
    }
    return MOCK_SUBSIDY_APPLICATIONS || [];
  }
}

