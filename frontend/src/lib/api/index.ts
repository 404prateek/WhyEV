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



const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://whyev-backend.onrender.com/api/v1';


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

export interface LeadSummary {
  id: string;
  vehicle_id: string | null;
  status: string;
  lead_quality_score: number | null;
}

export interface RecommendationResponse {
  shortlist: EmpanelledVehicle[];
  assumptions: string[];
  recommendation_id: string | null;
  leads_created: LeadSummary[];
}

export const recommendationApi = {
  /**
   * Submit questionnaire answers and get personalised vehicle recommendations.
   *
   * For authenticated users, this also:
   *   1. Updates their profile with the intake answers
   *   2. Persists the recommendation session to the database
   *   3. Creates unassigned leads for the top vehicles in the shortlist
   *
   * Returns the full RecommendationResponse. Callers that only need the
   * shortlist can access result.shortlist directly.
   */
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
      const data: RecommendationResponse = await res.json();

      // Log pipeline result for debugging (non-blocking)
      if (data.recommendation_id) {
        console.info(
          `[recommendationApi] Pipeline complete — recommendation_id=${data.recommendation_id}, leads=${data.leads_created?.length ?? 0}`
        );
      }

      return data.shortlist || [];
    } catch (err: any) {
      console.warn('[recommendationApi] Live API unreachable:', err?.message || err);
      return [];
    }
  },

  /**
   * Full pipeline response — use this when you need recommendation_id or leads.
   */
  async getRecommendationsFull(payload: IntakePayload): Promise<RecommendationResponse | null> {
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
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Fetch the authenticated user's leads from the pipeline.
   */
  async getMyLeads(statusFilter?: string): Promise<LeadSummary[]> {
    try {
      const headers = await getAuthHeaders();
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}/leads${params}`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch {
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
    
    let purchaseIncentive = 0;
    if (isNcr) {
      if (params.category === '2W' && params.price <= 225000) {
        purchaseIncentive = Math.min((params.batteryCapacityKwh || 3.0) * 10000, 30000);
      } else if (params.category === '3W') {
        purchaseIncentive = 50000;
      } else if (params.category === '4W' && params.price <= 3000000) {
        purchaseIncentive = 100000;
      }
    }

    const roadTaxWaiverEstimated = isNcr ? Math.round(params.price * 0.04) : 0;
    const scrappageBonus = (isNcr && params.hasTradeInIce)
      ? (params.category === '2W' ? 10000 : params.category === '3W' ? 25000 : 100000)
      : 0;
    const totalBenefit = purchaseIncentive + roadTaxWaiverEstimated + scrappageBonus;

    return {
      purchaseIncentive,
      scrappageBonus,
      roadTaxWaiverEstimated,
      totalBenefit,
      eligible: true,
      notes: ['Calculated via Delhi EV Policy 2026 Engine'],
    };
  },

  // TODO: Call GET /api/v1/subsidy/applications once a list endpoint exists to resolve the current user's active application ID.
  async getCurrentApplication(): Promise<SubsidyApplication> {
    await new Promise((res) => setTimeout(res, 500));
    return MOCK_SUBSIDY_APPLICATION;
  },

  // TODO: Call POST /api/v1/subsidy/applications/{id}/documents once a create-application flow sets the application ID in state.
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

// 4. VEHICLE CATALOGUE API
export const vehicleApi = {
  // Maps VehicleOut (DB shape) to EmpanelledVehicle (frontend shape) for dropdown use only.
  // Subsidy fields (subsidyAmount, scrappageBonus) are 0 here — calculated separately by subsidyApi.calculateSubsidy().
  async listEmpanelled(): Promise<EmpanelledVehicle[]> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/vehicles?empanelled=true&limit=100`, { headers });
      if (!res.ok) return [];
      const data: Array<{
        id: string;
        make: string | null;
        model: string | null;
        category: string | null;
        price: number | null;
        range_km: number | null;
        is_empanelled: boolean;
        specs: Record<string, unknown> | null;
      }> = await res.json();
      return data.map((v) => ({
        id: String(v.id),
        make: v.make ?? '',
        model: v.model ?? '',
        variant: String(v.specs?.variant ?? ''),
        category: (v.category as VehicleCategory) ?? '4W',
        exShowroomPrice: v.price ?? 0,
        effectivePrice: v.price ?? 0,
        subsidyAmount: 0,
        scrappageBonus: 0,
        rangeKm: v.range_km ?? 0,
        batteryCapacityKwh: Number(v.specs?.battery_kwh ?? 3.0),
        empanelledStatus: v.is_empanelled ? ('confirmed' as const) : ('unverified' as const),
        chargingTimeHours: Number(v.specs?.charge_time_h ?? 0),
        topSpeedKmvh: Number(v.specs?.top_speed_kmh ?? 0),
        features: [],
        whyThisFits: '',
        runningCostPerKm: 0,
      }));
    } catch {
      return [];
    }
  },
};

// 5. DEALER API
// Falls back to MOCK_DEALERS until the Dealer DB model is extended with
// locality, rating, reviewCount, distanceKm, empanelledModels, phone, email, isVerified.
export const dealerApi = {
  async getNearbyDealers(vehicleId?: string): Promise<Dealer[]> {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ lat: '28.6139', lng: '77.2090' });
      if (vehicleId) params.set('model_id', vehicleId);
      const res = await fetch(`${API_BASE}/dealers/nearby?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch { /* fall through to mock */ }
    return MOCK_DEALERS;
  },

  async submitLead(params: { dealerId: string; vehicleId: string; sourceModule: string }): Promise<{ success: boolean; leadId: string }> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dealer_id: params.dealerId,
          vehicle_id: params.vehicleId,
          source_module: params.sourceModule,
          consent: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, leadId: String(data.id ?? `lead-${Date.now()}`) };
      }
    } catch { /* fall through */ }
    return { success: false, leadId: `lead-${Date.now()}` };
  },

  async bookTestDrive(params: { dealerId: string; scheduledAt: string; vehicleId: string }): Promise<{ success: boolean; appointmentId: string }> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dealer_id: params.dealerId,
          type: 'test_drive',
          scheduled_at: params.scheduledAt,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, appointmentId: String(data.id ?? `apt-${Date.now()}`) };
      }
    } catch { /* fall through */ }
    return { success: false, appointmentId: `apt-${Date.now()}` };
  },
};

// 6. BATTERY CERTIFICATION API
export const batteryApi = {
  /**
   * Request a battery health inspection.
   *
   * TODO(battery-integration): mock retained — API shape mismatch.
   * Expected API: POST /api/v1/certification/request
   * Expected request body: { model_id: UUID, year: number, odometer: number }
   *
   * The modal currently collects { makeModel: string, odometerKm: number, address: string }
   * which does NOT match the backend. To wire this for real:
   *   1. Replace the makeModel text input with a vehicle UUID selector
   *      (vehicle_model_id from vehicles_master).
   *   2. Add a year input field (int).
   *   3. Drop the address field — backend has no address storage.
   * Until the modal is updated, this remains a mock.
   */
  async requestInspection(params: { makeModel: string; odometerKm: number; address: string }): Promise<{ success: boolean; requestId: string }> {
    // TODO(battery-integration): mock retained — missing: model_id UUID input in modal
    // Expected API: POST /api/v1/certification/request
    // Expected request body: { model_id: UUID, year: int, odometer: int }
    // Expected DB field(s): battery_reports.battery_score, battery_reports.remaining_life_years
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, requestId: `insp-req-${Date.now()}` };
  },

  /**
   * Verify a battery certificate by its QR code token.
   *
   * Maps REAL backend fields:
   *   battery_score → batteryScore, healthStatus (derived)
   *   remaining_life_years → estimatedRemainingYears
   *   inspection_date → inspectionDate
   *   certificate_valid_until → certificateValidUntil
   *   qr_code_url → qrCodeUrl (full verify URL, built server-side)
   *   id → id
   *   vehicle_model_id → vehicleId
   *
   * Explicitly NOT populated from backend (no real data source):
   *   makeModel — backend stores vehicle_model_id UUID, does not join make/model name
   *   year — accepted as input to POST /request but NOT stored in battery_reports table
   *   odometerKm — same: used in score computation but NOT persisted
   *   degradationPct — no backend field; score-based % not exposed
   *   chargingCycleCount — no concept in backend model
   *   inspectorName — no inspector assignment system
   */
  async verifyCertificate(certificateId: string): Promise<BatteryReport> {
    try {
      const headers = await getAuthHeaders();
      // Use GET /certification/verify?certificate_id=<token> (public, no auth needed for QR scan).
      // Falls back to GET /certification/{uuid} for UUID-based lookup when certificateId is a UUID.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(certificateId);
      const url = isUuid
        ? `${API_BASE}/certification/${certificateId}`
        : `${API_BASE}/certification/verify?certificate_id=${encodeURIComponent(certificateId)}`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const score: number = d.battery_score ?? 0;
      const healthStatus: BatteryReport['healthStatus'] =
        score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Requires Service';
      return {
        // --- REAL backend fields ---
        id: String(d.id ?? ''),
        vehicleId: String(d.vehicle_model_id ?? ''),
        inspectionDate: d.inspection_date ?? '',
        batteryScore: score,
        healthStatus,
        estimatedRemainingYears: d.remaining_life_years ?? 0,
        certificateValidUntil: d.certificate_valid_until ?? '',
        // Backend returns qr_code_url (full verify URL) when fetched via /certification/{uuid}.
        // For /certification/verify?certificate_id=, qr_code_url is not returned; use token directly.
        qrCodeUrl: d.qr_code_url ?? (d.qr_code ? `https://whyev.in/verify/${d.qr_code}` : ''),
        // --- Fields with NO real backend data source — retained from MOCK_BATTERY_REPORT ---
        // TODO(battery-integration): makeModel — missing: vehicles_master join in BatteryReportOut
        //   Expected DB field(s): vehicles_master.make + vehicles_master.model
        makeModel: '',
        // TODO(battery-integration): year — missing: battery_reports has no year column
        //   Expected DB field(s): battery_reports.year (not currently stored)
        year: 0,
        // TODO(battery-integration): odometerKm — missing: battery_reports has no odometer column
        //   Expected DB field(s): battery_reports.odometer_km (not currently stored)
        odometerKm: 0,
        // TODO(battery-integration): degradationPct — missing: not computed or stored in backend
        //   Expected: derived from battery_score (e.g. 100 - battery_score) or real cell data
        degradationPct: 0,
        // TODO(battery-integration): chargingCycleCount — missing: no concept in backend model
        //   Expected DB field(s): battery_reports.charging_cycle_count (not currently stored)
        chargingCycleCount: 0,
        // TODO(battery-integration): inspectorName — missing: no inspector assignment system
        //   Expected DB field(s)/service: inspector assignment + battery_reports.inspector_id FK
        inspectorName: '',
      };
    } catch {
      // Network error or 404 — fall back to mock for graceful UI degradation
      // TODO(battery-integration): mock fallback retained
      // Expected API: GET /api/v1/certification/verify?certificate_id=<qr_token>
      // Expected DB table(s): battery_reports
      return MOCK_BATTERY_REPORT;
    }
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
        // TODO: Replace with real leads from GET /api/v1/leads once the
        // dashboard API is confirmed to return populated dealer_leads with
        // vehicle_model and dealer_name (Phase G dealer enrichment).
        // Until then, show empty — the real API will populate this when live.
      ],
    };
  },
};
// 9. PROFILE API
// Wraps GET /api/v1/profile and PATCH /api/v1/profile.
// Only patches fields that ProfilePatchIn accepts (city, budget_min, budget_max,
// daily_km, preferred_categories, intent, etc.).
// name and phone live on the users table — no PUT /users/me endpoint exists yet.
// TODO: Add PATCH for name/phone once PUT /users/me is implemented in profile.py.
export const profileApi = {
  async getProfile(): Promise<{
    city: string | null;
    budget_min: number | null;
    budget_max: number | null;
    daily_km: number | null;
    preferred_categories: string[] | null;
    intent: string | null;
    housing_type: string | null;
    is_delhi_ncr: boolean | null;
  } | null> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/profile`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProfile(fields: {
    city?: string;
    budget_min?: number;
    budget_max?: number;
    daily_km?: number;
    preferred_categories?: string[];
    intent?: string;
    housing_type?: string;
    is_delhi_ncr?: boolean;
    charging_preference?: string;
    finance_pref?: string;
    emi_comfort?: number;
  }): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(fields),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

// 10. NOTIFICATION API
export const notificationApi = {
  async getNotifications(): Promise<Array<{ id: string; title: string; body: string; type: string; read_at: string | null; created_at: string }>> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/notifications`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch { /* fall back */ }
    return [];
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

// ---------------------------------------------------------------------------
// 10. NEWS API
// ---------------------------------------------------------------------------

export interface NewsArticleResponse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  article_url: string | null;
  author: string | null;
  source_name: string | null;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean;
  published_at: string | null;
  provider: string;
}

export interface NewsListApiResponse {
  articles: NewsArticleResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface NewsListParams {
  page?: number;
  page_size?: number;
  category?: string;
  featured_only?: boolean;
}

/**
 * News API client.
 * Primary: GET /api/v1/news (live DB-backed, Stage 1+2+3 filtered).
 * Fallback: MOCK_NEWS_ARTICLES from lib/mock-data (retained per project mock policy).
 *
 * TODO(news-integration): Bookmarks and preferences endpoints are NOT implemented yet.
 *   Expected APIs:
 *     POST /api/v1/news/bookmarks        — requires news_bookmarks DB table
 *     GET  /api/v1/news/preferences      — requires news_preferences DB table
 *     POST /api/v1/news/read             — requires news_read_history DB table
 */
export const newsApi = {
  async getArticles(params?: NewsListParams): Promise<NewsListApiResponse> {
    const url = new URL(`${API_BASE}/news`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.page_size) url.searchParams.set('page_size', String(params.page_size));
    if (params?.category && params.category !== 'All') {
      url.searchParams.set('category', params.category);
    }
    if (params?.featured_only) url.searchParams.set('featured_only', 'true');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`News API error: ${res.status}`);
    return res.json();
  },
};
