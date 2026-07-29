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
import { getSupabaseToken } from '@/lib/supabaseClient';
import { useAuthStore, useIntakeStore } from '@/lib/store';
import { SEEDED_VEHICLES_MASTER } from '@/lib/seed/vehiclesMaster';

/**
 * WhyEV API Client Layer
 * Note for Backend Team:
 * Replace mock implementations below with live API endpoints as defined in Section 16 of WhyEV PRD.
 */



const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Returns auth header — uses Supabase session token if available, falls back to dev token
async function getAuthHeaders(): Promise<Record<string, string>> {
  let token = 'dev-token-xyz';
  try {
    const supabaseToken = await getSupabaseToken();
    if (supabaseToken) token = supabaseToken;
  } catch {
    // Supabase not available — use dev token
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

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
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          budget_max: payload.budgetMax,
          preferred_categories: [payload.category],
          daily_km: payload.dailyCommuteKm,
          city: payload.isDelhiResident ? 'Delhi' : 'Other',
          housing_type: payload.housingType,
          trade_in_ice: payload.tradeInIce,
        }),
      });
      if (!res.ok) {
        console.warn(`[recommendationApi] Live API endpoint returned HTTP ${res.status}`);
        return [];
      }
      const data = await res.json();
      return data.shortlist || [];
    } catch (err: any) {
      console.warn('[recommendationApi] Live API unreachable:', err?.message || err);
      return [];
    }
  },

  async saveVehicle(vehicleId: string): Promise<{ success: boolean }> {
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
    price: number;
    city: string;
    regYear: number;
    gvw?: number;
  }): Promise<{
    purchaseIncentive: number;
    scrappageBonus: number;
    roadTaxWaiverEstimated: number;
    totalBenefit: number;
    eligible: boolean;
    reasonIfIneligible?: string;
    taxExemptionPct?: number;
    notes?: string[];
  }> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/subsidy/calculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: params.category,
          city: params.city,
          price: params.price,
          vehicle_price: params.price,
          battery: params.batteryCapacityKwh,
          battery_kwh: params.batteryCapacityKwh,
          scrapping: params.hasTradeInIce ? 'yes' : 'no',
          scrappage: params.hasTradeInIce ? 'yes' : 'no',
          gvw: params.gvw ?? 1.5,
          reg_year: params.regYear,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const breakdown = data.amount_breakdown || data;

        return {
          purchaseIncentive: breakdown.direct_subsidy ?? breakdown.base_amount ?? data.direct_subsidy ?? 0,
          scrappageBonus: breakdown.scrappage_bonus ?? data.scrappage_bonus ?? 0,
          roadTaxWaiverEstimated: breakdown.road_tax_waiver ?? data.road_tax_waiver ?? 0,
          totalBenefit: breakdown.total_benefit ?? breakdown.total ?? data.total_benefit ?? 0,
          eligible: breakdown.eligible ?? data.eligible ?? true,
          reasonIfIneligible: breakdown.ineligible_reason ?? data.ineligible_reason ?? data.reason,
          taxExemptionPct: breakdown.tax_exemption_pct,
          notes: breakdown.notes,
        };
      }
    } catch (e) {
      console.warn('Backend fetch error in calculateSubsidy, using fallback policy math:', e);
    }

    // Fallback local Delhi Policy 2026 calculation
    const isDelhi = (params.city || '').toLowerCase().includes('delhi');
    const roadTaxWaiverEstimated = isDelhi ? Math.round(params.price * 0.04) : 0;
    const scrappageBonus = (isDelhi && params.hasTradeInIce) ? (params.category === '4W' ? 100000 : 10000) : 0;
    const totalBenefit = roadTaxWaiverEstimated + scrappageBonus;

    return {
      purchaseIncentive: 0,
      scrappageBonus,
      roadTaxWaiverEstimated,
      totalBenefit,
      eligible: true,
      notes: ['Calculated via Delhi EV Policy 2026 Engine'],
    };
  },

  async getCurrentApplication(): Promise<SubsidyApplication> {
    await new Promise((res) => setTimeout(res, 500));
    return MOCK_SUBSIDY_APPLICATION;
  },

  async uploadClaimDocuments(formData: FormData): Promise<{ success: boolean; documentId: string }> {
    await new Promise((res) => setTimeout(res, 1200));
    return { success: true, documentId: 'doc-rc-verified-99' };
  },

  async extractOcrData(formData: FormData): Promise<{
    success: boolean;
    confidence: 'high' | 'medium' | 'low';
    extracted_data: {
      rc_number: string;
      registration_date: string;
      vehicle_category: string;
      chassis_number: string;
    };
    s3_url?: string;
  }> {
    const authHeaders = await getAuthHeaders();
    // FormData handles its own multipart boundary, so omit Content-Type
    const headers: Record<string, string> = {
      Authorization: authHeaders.Authorization,
    };

    const res = await fetch(`${API_BASE}/subsidy/ocr-extract`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Vision OCR pre-fill failed`);
    }
    return await res.json();
  },
};

// 4. DEALER API
export const dealerApi = {
  async getNearbyDealers(vehicleId?: string): Promise<Dealer[]> {
    await new Promise((res) => setTimeout(res, 600));
    return MOCK_DEALERS;
  },

  async submitLead(params: { dealerId: string; vehicleId: string; sourceModule: string }): Promise<{ success: boolean; leadId: string }> {
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, leadId: `lead-${Date.now()}` };
  },

  async bookTestDrive(params: { dealerId: string; scheduledAt: string; vehicleId: string }): Promise<{ success: boolean; appointmentId: string }> {
    await new Promise((res) => setTimeout(res, 900));
    return { success: true, appointmentId: `apt-${Date.now()}` };
  },
};

// 5. BATTERY CERTIFICATION API
export const batteryApi = {
  async requestInspection(params: { makeModel: string; odometerKm: number; address: string }): Promise<{ success: boolean; requestId: string }> {
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, requestId: `insp-req-${Date.now()}` };
  },

  async verifyCertificate(certificateId: string): Promise<BatteryReport> {
    await new Promise((res) => setTimeout(res, 600));
    return MOCK_BATTERY_REPORT;
  },
};

// 6. AI AGENT ORCHESTRATOR API
export const aiAgentApi = {
  async sendMessage(
    history: AiChatMessage[],
    userPrompt: string,
    onChunk?: (text: string) => void
  ): Promise<AiChatMessage> {
    let fullText = '';
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/agent/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: userPrompt,
          conversation_id: "00000000-0000-0000-0000-000000000001",
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let lineEnd = buffer.indexOf('\n\n');
          while (lineEnd !== -1) {
            const eventString = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 2);
            
            if (eventString.startsWith('data: ')) {
              try {
                const data = JSON.parse(eventString.slice(6));
                if (data.type === 'token' && data.text) {
                  fullText += data.text;
                  if (onChunk) onChunk(fullText);
                } else if (data.text) {
                  fullText += data.text;
                  if (onChunk) onChunk(fullText);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
            lineEnd = buffer.indexOf('\n\n');
          }
        }
      }
    } catch (e) {
      console.warn('Backend stream error in aiAgentApi, using local Voltu fallback:', e);
    }

    if (!fullText.trim()) {
      const promptLower = userPrompt.toLowerCase();
      if (promptLower.includes('eligible') || promptLower.includes('subsidy')) {
        fullText = "Namaste! 🙏 I am Voltu. Under Delhi EV Policy 2026, all empanelled electric vehicles purchased and registered in Delhi qualify for a 100% Road Tax Waiver and Scrappage Bonus (up to ₹1,00,000 for 4W / ₹10,000 for 2W). Make sure to upload your RC within 30 days of registration to claim your subsidy!";
      } else if (promptLower.includes('deadline') || promptLower.includes('30-day') || promptLower.includes('rc')) {
        fullText = "Namaste! 🙏 Under the Delhi EV Policy 2026, buyers must submit their vehicle RC and bank details within exactly 30 days of RC issuance. Delays beyond 30 days result in automated subsidy forfeiture by the transport department.";
      } else if (promptLower.includes('car') || promptLower.includes('10 lakh') || promptLower.includes('best ev') || promptLower.includes('recommend')) {
        fullText = "Namaste! 🙏 Here are the top empanelled EV models under ₹10 Lakh in Delhi:\n\n• Tata Tiago EV — Ex-Showroom ₹6.99 Lakh (Effective On-Road: ₹6.46 Lakh | 285 km range)\n• MG Comet EV — Ex-Showroom ₹7.80 Lakh (Effective On-Road: ₹7.23 Lakh | 230 km range)\n• Tata Punch EV — Ex-Showroom ₹9.69 Lakh (Effective On-Road: ₹9.05 Lakh | 421 km range)\n\nAll models qualify for 100% Road Tax Waiver and Free 1st-Year Insurance under Delhi Policy 2026!";
      } else {
        fullText = "Namaste! 🙏 I am Voltu, your WhyEV AI Assistant. I can calculate your exact Delhi 2026 EV subsidy, check your 30-day RC deadline, or recommend empanelled EVs for your daily commute. How can I help you today?";
      }
      if (onChunk) onChunk(fullText);
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      agentType: 'Voltu',
      text: fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};

// 7. AUTH API (Phone OTP)
export const authApi = {
  async requestOtp(phone: string): Promise<{ success: boolean }> {
    // TODO: Connect to backend /auth/otp/request when endpoint is added
    await new Promise((res) => setTimeout(res, 800));
    console.log('[WhyEV] OTP requested for:', phone);
    return { success: true };
  },

  async verifyOtp(phone: string, otp: string): Promise<{ user: UserProfile }> {
    // TODO: Connect to backend /auth/otp/verify when endpoint is added
    // That endpoint should return a JWT; store it and use getAuthHeaders()
    await new Promise((res) => setTimeout(res, 800));
    const user: UserProfile = {
      ...MOCK_USER_PROFILE,
      id: `otp-usr-${Date.now()}`,
      name: `User (${phone.slice(-4)})`,
      email: `${phone}@whatsapp.user`,
      phone,
      isDelhiResident: true,
    };
    return { user };
  },
};

export interface DashboardSubsidyApp {
  id: string;
  vehicle_id?: string;
  vehicle_model_name: string;
  registration_state: string;
  rc_issue_date?: string;
  filing_deadline?: string;
  days_remaining: number;
  status: string;
  calculated_subsidy: number;
  scrappage_bonus: number;
  tax_waiver_estimated: number;
  total_benefit: number;
}

export interface DashboardSavedVehicle {
  id: string;
  make: string;
  model: string;
  variant?: string;
  category: string;
  ex_showroom_price: number;
  battery_kwh: number;
  range_km: number;
  image_url?: string;
}

export interface DashboardDealerLead {
  id: string;
  dealer_name: string;
  vehicle_model: string;
  status: string;
  submitted_at?: string;
}

export interface DashboardData {
  user_name: string;
  subsidy_applications: DashboardSubsidyApp[];
  saved_vehicles: DashboardSavedVehicle[];
  dealer_leads: DashboardDealerLead[];
}

export const userApi = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/users/me/dashboard`, {
        method: 'GET',
        headers,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[userApi] Backend dashboard API unreachable, displaying command centre state:', e);
    }

    // Dynamic client dashboard state fallback
    const user = useAuthStore.getState().user;
    const savedIds = useIntakeStore.getState().savedVehicleIds;
    const savedVehicles = SEEDED_VEHICLES_MASTER.filter((v) => savedIds.includes(v.id)).map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      variant: v.variant,
      category: v.category,
      ex_showroom_price: v.exShowroomPrice,
      battery_kwh: v.batteryCapacityKwh,
      range_km: v.rangeKm,
      image_url: v.imageUrl,
    }));

    return {
      user_name: user?.name || 'EV Driver',
      subsidy_applications: [
        {
          id: 'app-delhi-2026-001',
          vehicle_model_name: 'Tata Tiago EV (2026 Facelift)',
          registration_state: 'Delhi',
          status: 'documents_pending',
          days_remaining: 18,
          calculated_subsidy: 0,
          scrappage_bonus: 100000,
          tax_waiver_estimated: 27960,
          total_benefit: 152960,
        },
      ],
      saved_vehicles:
        savedVehicles.length > 0
          ? savedVehicles
          : [
              {
                id: 'tata-tiago-ev',
                make: 'Tata Motors',
                model: 'Tiago EV',
                variant: '2026 Facelift (19.2 - 24 kWh)',
                category: '4W',
                ex_showroom_price: 699000,
                battery_kwh: 24,
                range_km: 285,
              },
            ],
      dealer_leads: [
        {
          id: 'lead-001',
          dealer_name: 'Pragati Tata EV Showroom (Okhla)',
          vehicle_model: 'Tata Tiago EV',
          status: 'Callback Requested',
        },
      ],
    };
  },
};

