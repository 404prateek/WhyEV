import {
  MOCK_EMPANELLED_VEHICLES,
  MOCK_DEALERS,
  MOCK_SUBSIDY_APPLICATION,
  MOCK_USER_PROFILE,
  MOCK_BATTERY_REPORT,
} from '@/lib/mock-data';
import {
  EmpanelledVehicle,
  Dealer,
  SubsidyApplication,
  UserProfile,
  BatteryReport,
  VehicleCategory,
  AiChatMessage,
} from '@/types';

/**
 * WhyEV API Client Layer
 * Note for Backend Team:
 * Replace mock implementations below with live API endpoints as defined in Section 16 of WhyEV PRD.
 */

// 1. AUTH API
export const authApi = {
  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    // BACKEND_API_PLACEHOLDER: POST /auth/otp/request
    await new Promise((res) => setTimeout(res, 600));
    return { success: true, message: `OTP sent to ${phone}` };
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; user: UserProfile }> {
    // BACKEND_API_PLACEHOLDER: POST /auth/otp/verify
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, user: MOCK_USER_PROFILE };
  },

  async loginWithGoogle(): Promise<{ success: boolean; user: UserProfile }> {
    // BACKEND_API_PLACEHOLDER: POST /auth/google
    await new Promise((res) => setTimeout(res, 700));
    return { success: true, user: MOCK_USER_PROFILE };
  },
};

// 2. RECOMMENDATION API
export interface IntakePayload {
  budgetMax: number;
  category: VehicleCategory;
  dailyCommuteKm: number;
  housingType: 'apartment' | 'independent_house';
  tradeInIce: boolean;
  isDelhiResident: boolean;
}

export const recommendationApi = {
  async getRecommendations(payload: IntakePayload): Promise<EmpanelledVehicle[]> {
    // BACKEND_API_PLACEHOLDER: POST /recommendations (intake payload)
    await new Promise((res) => setTimeout(res, 900));

    let filtered = MOCK_EMPANELLED_VEHICLES.filter(
      (v) => v.category === payload.category && v.effectivePrice <= payload.budgetMax + 200000
    );

    if (filtered.length === 0) {
      filtered = MOCK_EMPANELLED_VEHICLES.slice(0, 3);
    }

    return filtered;
  },

  async saveVehicle(vehicleId: string): Promise<{ success: boolean }> {
    // BACKEND_API_PLACEHOLDER: POST /vehicles/save
    await new Promise((res) => setTimeout(res, 400));
    return { success: true };
  },
};

// 3. SUBSIDY API
export const subsidyApi = {
  async calculateSubsidy(params: {
    category: VehicleCategory;
    batteryCapacityKwh: number;
    hasTradeInIce: boolean;
    isDelhiResident: boolean;
  }): Promise<{
    purchaseIncentive: number;
    scrappageBonus: number;
    roadTaxWaiverEstimated: number;
    totalBenefit: number;
    eligible: boolean;
    reasonIfIneligible?: string;
  }> {
    // BACKEND_API_PLACEHOLDER: POST /subsidy/calculate
    await new Promise((res) => setTimeout(res, 700));

    if (!params.isDelhiResident) {
      return {
        purchaseIncentive: 0,
        scrappageBonus: 0,
        roadTaxWaiverEstimated: 0,
        totalBenefit: 0,
        eligible: false,
        reasonIfIneligible: 'Delhi residency proof (RC address) required for Delhi EV Policy 2026 subsidy.',
      };
    }

    let purchaseIncentive = 0;
    let scrappageBonus = params.hasTradeInIce ? 5000 : 0;
    let roadTaxWaiver = 12500;

    if (params.category === '2W') {
      purchaseIncentive = Math.min(params.batteryCapacityKwh * 5000, 20000);
      roadTaxWaiver = 8000;
    } else if (params.category === '4W') {
      purchaseIncentive = Math.min(params.batteryCapacityKwh * 10000, 150000);
      scrappageBonus = params.hasTradeInIce ? 25000 : 0;
      roadTaxWaiver = 125000;
    } else {
      purchaseIncentive = 30000;
      roadTaxWaiver = 15000;
    }

    return {
      purchaseIncentive,
      scrappageBonus,
      roadTaxWaiverEstimated: roadTaxWaiver,
      totalBenefit: purchaseIncentive + scrappageBonus + roadTaxWaiver,
      eligible: true,
    };
  },

  async getCurrentApplication(): Promise<SubsidyApplication> {
    // BACKEND_API_PLACEHOLDER: GET /subsidy/applications/current
    await new Promise((res) => setTimeout(res, 500));
    return MOCK_SUBSIDY_APPLICATION;
  },

  async uploadClaimDocuments(formData: FormData): Promise<{ success: boolean; documentId: string }> {
    // BACKEND_API_PLACEHOLDER: POST /subsidy/applications/{id}/documents
    await new Promise((res) => setTimeout(res, 1200));
    return { success: true, documentId: 'doc-rc-verified-99' };
  },
};

// 4. DEALER API
export const dealerApi = {
  async getNearbyDealers(vehicleId?: string): Promise<Dealer[]> {
    // BACKEND_API_PLACEHOLDER: GET /dealers/nearby
    await new Promise((res) => setTimeout(res, 600));
    return MOCK_DEALERS;
  },

  async submitLead(params: { dealerId: string; vehicleId: string; sourceModule: string }): Promise<{ success: boolean; leadId: string }> {
    // BACKEND_API_PLACEHOLDER: POST /leads
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, leadId: `lead-${Date.now()}` };
  },

  async bookTestDrive(params: { dealerId: string; scheduledAt: string; vehicleId: string }): Promise<{ success: boolean; appointmentId: string }> {
    // BACKEND_API_PLACEHOLDER: POST /appointments
    await new Promise((res) => setTimeout(res, 900));
    return { success: true, appointmentId: `apt-${Date.now()}` };
  },
};

// 5. BATTERY CERTIFICATION API
export const batteryApi = {
  async requestInspection(params: { makeModel: string; odometerKm: number; address: string }): Promise<{ success: boolean; requestId: string }> {
    // BACKEND_API_PLACEHOLDER: POST /certification/request
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, requestId: `insp-req-${Date.now()}` };
  },

  async verifyCertificate(certificateId: string): Promise<BatteryReport> {
    // BACKEND_API_PLACEHOLDER: GET /certification/{id}/verify (Public endpoint)
    await new Promise((res) => setTimeout(res, 600));
    return MOCK_BATTERY_REPORT;
  },
};

// 6. AI AGENT ORCHESTRATOR API
export const aiAgentApi = {
  async sendMessage(history: AiChatMessage[], userPrompt: string): Promise<AiChatMessage> {
    // BACKEND_API_PLACEHOLDER: POST /agent/message (Interacts with Vector DB + Orchestrator LLM)
    await new Promise((res) => setTimeout(res, 1100));

    const promptLower = userPrompt.toLowerCase();
    let responseText = "I'm your WhyEV AI Assistant! I can help you calculate your Delhi EV Policy 2026 subsidy, shortlist empanelled models, or connect with verified dealers.";
    let agentType: AiChatMessage['agentType'] = 'Orchestrator';

    if (promptLower.includes('subsidy') || promptLower.includes('delhi 2026') || promptLower.includes('policy')) {
      agentType = 'Eligibility';
      responseText = "Under the Delhi EV Policy 2026 (effective July 1, 2026), 4-wheel EVs get up to ₹1,50,000 purchase incentive + ₹25,000 scrappage bonus + 100% road tax waiver! Applications must be filed within 30 days of RC issuance.";
    } else if (promptLower.includes('range') || promptLower.includes('battery') || promptLower.includes('model') || promptLower.includes('recommend')) {
      agentType = 'Recommendation';
      responseText = "Based on Delhi traffic conditions, the Tata Nexon.ev (465 km range) and Ather 450X (150 km range) lead in battery efficiency and fast-charging grid support. Would you like to set your daily commute distance?";
    } else if (promptLower.includes('dealer') || promptLower.includes('test drive') || promptLower.includes('price')) {
      agentType = 'Dealer';
      responseText = "We have 3 empanelled dealers in Delhi-NCR (Okhla, Connaught Place, and Gurgaon) offering exclusive Wallbox charger installations. You can book a test drive without any aggressive sales calls!";
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      agentType,
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
