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
    // Covers all Delhi NCR cities: Delhi, Gurugram, Noida, Faridabad, Ghaziabad, Greater Noida
    const NCR_CITIES = ['delhi', 'gurugram', 'gurgaon', 'noida', 'faridabad', 'ghaziabad', 'greater noida', 'new delhi'];
    const isNcr = NCR_CITIES.some(c => (params.city || '').toLowerCase().includes(c));
    const roadTaxWaiverEstimated = isNcr ? Math.round(params.price * 0.04) : 0;
    const scrappageBonus = (isNcr && params.hasTradeInIce)
      ? (params.category === '2W' ? 10000 : params.category === '3W' ? 25000 : 100000)
      : 0;
    const totalBenefit = roadTaxWaiverEstimated + scrappageBonus;

    return {
      purchaseIncentive: 0,
      scrappageBonus,
      roadTaxWaiverEstimated,
      totalBenefit,
      eligible: true,
      notes: ['Calculated via Delhi EV Policy 2026 Engine (offline fallback)'],
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
      console.error('[Voltu] Backend connection failed — falling back to local responses. Check NEXT_PUBLIC_API_URL env var.', e);
    }

    // Only use fallback when backend truly failed (empty response)
    if (!fullText.trim()) {
      // Note: Use • bullets — the chat renderer handles them. Do NOT use **text** here
      // because the fallback fires when backend is down and markdown doesn't help diagnosis.
      const q = userPrompt.toLowerCase();
      if (q.includes('subsid') || q.includes('eligible') || q.includes('benefit')) {
        fullText = [
          "Under Delhi EV Policy 2026, if you buy an empanelled EV and register in Delhi NCR, you get:",
          "• 100% Road Tax Waiver (4% of ex-showroom price — e.g. ₹56,000 on a ₹14L car)",
          "• Scrappage Bonus: ₹1,00,000 for 4W / ₹10,000 for 2W if you trade in an old petrol vehicle",
          "• Free 1st-Year Comprehensive Insurance (Govt paid)",
          "• Free RTO RC Registration (100% waived)",
          "",
          "Type your EV model, city, and whether you have a trade-in for an exact calculation.",
        ].join('\n');
      } else if (q.includes('car') || q.includes('lakh') || q.includes('ev') || q.includes('suggest') || q.includes('recommend') || q.includes('best')) {
        fullText = [
          "Here are top Delhi-empanelled EVs in 2026:",
          "• Tata Tiago EV — ₹6.99L ex-showroom | 285 km range | Hatchback",
          "• MG Comet EV — ₹7.80L ex-showroom | 230 km range | Micro SUV",
          "• Tata Punch EV — ₹9.69L ex-showroom | 421 km range | Compact SUV",
          "• Tata Nexon EV — ₹14.49L ex-showroom | 465 km range | Mid SUV",
          "• MG Windsor EV — ₹13.50L ex-showroom | 332 km range | Crossover",
          "• Mahindra BE 6 — ₹18.90L ex-showroom | 556 km range | Performance SUV",
          "",
          "All qualify for 100% Road Tax Waiver + Free Insurance under Delhi EV Policy 2026. Tell me your budget and daily commute distance for a personalised shortlist!",
        ].join('\n');
      } else if (q.includes('deadline') || q.includes('30') || q.includes('rc') || q.includes('days')) {
        fullText = [
          "The 30-Day RC Filing Rule is mandatory under Delhi EV Policy 2026:",
          "• After your vehicle RC is issued, you have exactly 30 days to file on the GNCTD transport portal",
          "• Missing the deadline = automatic forfeiture of all subsidies — no extensions allowed",
          "• Documents needed: RC copy, purchase invoice, Aadhaar-linked bank account, dealer certificate",
          "",
          "Tell me your RC registration date and I'll calculate your exact deadline!",
        ].join('\n');
      } else if (q.includes('dealer') || q.includes('showroom') || q.includes('charging')) {
        fullText = [
          "Delhi NCR has 4,500+ public EV charging stations and empanelled dealers across:",
          "• Central Delhi: Connaught Place, Karol Bagh, Nehru Place",
          "• South Delhi: Saket, Vasant Kunj, Okhla",
          "• Noida / Greater Noida: Sector 18, Sector 62, Greater Noida Expressway",
          "• Gurugram: Golf Course Road, Udyog Vihar, Cyber City",
          "",
          "Visit the Map tab in WhyEV to see live charging stations near you!",
        ].join('\n');
      } else {
        fullText = [
          "Namaste! I'm Voltu, your WhyEV AI assistant. I can help you with:",
          "• Exact subsidy calculation — tell me your EV model, city, and trade-in status",
          "• Vehicle recommendations — best EVs under your budget in Delhi NCR",
          "• 30-day RC deadline — I'll calculate when you need to file your claim",
          "• Dealer and charging station info near you",
          "",
          "What would you like to know today?",
        ].join('\n');
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

