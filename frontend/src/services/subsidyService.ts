import { SubsidyRule, SubsidyApplication } from '@/types';
import { MOCK_SUBSIDY_RULES, MOCK_SUBSIDY_APPLICATIONS } from '@/lib/mock-data';

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
    return MOCK_SUBSIDY_APPLICATIONS || [];
  }
}
