import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, EmpanelledVehicle, VehicleCategory, AiChatMessage, SubsidyApplication } from '@/types';
import { MOCK_EMPANELLED_VEHICLES, MOCK_SUBSIDY_APPLICATION } from '@/lib/mock-data';
import { aiAgentApi } from '@/lib/api';

// --- 1. AUTH STORE WITH PERSISTENCE & MODAL CONTROL ---
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  targetRedirectUrl: string | null;
  authModalTitle: string | null;
  authModalSubtitle: string | null;
  isPermissionModalOpen: boolean;
  activePermissionRequest: 'location' | 'notifications' | 'camera' | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: (redirectUrl?: string, title?: string, subtitle?: string) => void;
  closeAuthModal: () => void;
  requestPermission: (perm: 'location' | 'notifications' | 'camera') => void;
  closePermissionModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      targetRedirectUrl: null,
      authModalTitle: null,
      authModalSubtitle: null,
      isPermissionModalOpen: false,
      activePermissionRequest: null,
      login: (user) => set({ user, isAuthenticated: true, isAuthModalOpen: false, authModalTitle: null, authModalSubtitle: null }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      openAuthModal: (redirectUrl, title, subtitle) =>
        set({
          isAuthModalOpen: true,
          targetRedirectUrl: redirectUrl || null,
          authModalTitle: title || null,
          authModalSubtitle: subtitle || null,
        }),
      closeAuthModal: () => set({ isAuthModalOpen: false, targetRedirectUrl: null, authModalTitle: null, authModalSubtitle: null }),
      requestPermission: (perm) => set({ isPermissionModalOpen: true, activePermissionRequest: perm }),
      closePermissionModal: () => set({ isPermissionModalOpen: false, activePermissionRequest: null }),
    }),
    {
      name: 'whyev-auth-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// --- 2. RECOMMENDATION INTAKE STORE ---
interface IntakeState {
  currentStep: number;
  budgetMax: number;
  dailyCommuteKm: number;
  housingType: 'apartment' | 'independent_house';
  hasAssignedParking: boolean;
  category: VehicleCategory;
  tradeInIce: boolean;
  showEffectivePrice: boolean;
  shortlist: EmpanelledVehicle[];
  savedVehicleIds: string[];
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateIntake: (data: Partial<IntakeState>) => void;
  toggleEffectivePrice: () => void;
  toggleSaveVehicle: (id: string) => void;
}

export const useIntakeStore = create<IntakeState>((set) => ({
  currentStep: 1,
  budgetMax: 1600000,
  dailyCommuteKm: 42,
  housingType: 'apartment',
  hasAssignedParking: true,
  category: '4W',
  tradeInIce: true,
  showEffectivePrice: true,
  shortlist: MOCK_EMPANELLED_VEHICLES.filter((v) => v.category === '4W'),
  savedVehicleIds: ['veh-4w-tatanexonev'],
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateIntake: (data) => set((state) => ({ ...state, ...data })),
  toggleEffectivePrice: () => set((state) => ({ showEffectivePrice: !state.showEffectivePrice })),
  toggleSaveVehicle: (id) =>
    set((state) => ({
      savedVehicleIds: state.savedVehicleIds.includes(id)
        ? state.savedVehicleIds.filter((vId) => vId !== id)
        : [...state.savedVehicleIds, id],
    })),
}));

// --- 3. SUBSIDY STORE ---
interface SubsidyState {
  application: SubsidyApplication;
  isDelhiResident: boolean;
  batteryCapacityKwh: number;
  hasScrappage: boolean;
  calculatedIncentive: number;
  scrappageIncentive: number;
  taxWaiverIncentive: number;
  isPdfModalOpen: boolean;
  setPdfModalOpen: (open: boolean) => void;
  updateCalculation: (incentive: number, scrappage: number, tax: number) => void;
}

export const useSubsidyStore = create<SubsidyState>((set) => ({
  application: MOCK_SUBSIDY_APPLICATION,
  isDelhiResident: true,
  batteryCapacityKwh: 40.5,
  hasScrappage: true,
  calculatedIncentive: 150000,
  scrappageIncentive: 25000,
  taxWaiverIncentive: 125000,
  isPdfModalOpen: false,
  setPdfModalOpen: (open) => set({ isPdfModalOpen: open }),
  updateCalculation: (incentive, scrappage, tax) =>
    set({
      calculatedIncentive: incentive,
      scrappageIncentive: scrappage,
      taxWaiverIncentive: tax,
    }),
}));

// --- 4. AI AGENT STORE ---
interface AiAgentState {
  isOpen: boolean;
  isThinking: boolean;
  messages: AiChatMessage[];
  toggleDrawer: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const useAiAgentStore = create<AiAgentState>((set, get) => ({
  isOpen: false,
  isThinking: false,
  messages: [
    {
      id: 'msg-init-1',
      sender: 'agent',
      agentType: 'Orchestrator',
      text: 'Namaste! 👋 I am your WhyEV AI Assistant. I can help calculate your exact Delhi 2026 subsidy, shortlist empanelled EVs for your daily commute, or connect you with verified dealers.',
      timestamp: 'Just now',
    },
  ],
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  sendMessage: async (text: string) => {
    const userMsg: AiChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
    }));

    try {
      const responseMsg = await aiAgentApi.sendMessage(get().messages, text);
      set((state) => ({
        messages: [...state.messages, responseMsg],
        isThinking: false,
      }));
    } catch {
      set({ isThinking: false });
    }
  },
}));

// --- 5. MEGA CITY LOCALIZATION STORE ---
export interface CityMetadata {
  id: string;
  name: string;
  state: string;
  landmark: string;
  policyTitle: string;
  policyActiveUntil: string;
  benefits: string;
  dealersCount: string;
  chargingBaysCount: string;
  popularSuburbs: string[];
}

export const MEGA_CITIES_DICTIONARY: Record<string, CityMetadata> = {
  'delhi-ncr': {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    state: 'Delhi',
    landmark: 'India Gate',
    policyTitle: 'Delhi EV Policy',
    policyActiveUntil: '31 March 2030',
    benefits: '100% Road Tax Waiver & Purchase Incentives',
    dealersCount: '180+ EV Showrooms',
    chargingBaysCount: '2,450+ Active Bays',
    popularSuburbs: ['Connaught Place', 'Okhla', 'Saket', 'Gurugram', 'Noida'],
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    landmark: 'Gateway of India',
    policyTitle: 'Maharashtra EV Policy',
    policyActiveUntil: '31 March 2027',
    benefits: '100% Road Tax & Registration Waiver',
    dealersCount: '140+ EV Showrooms',
    chargingBaysCount: '1,890+ Active Bays',
    popularSuburbs: ['Bandra', 'Andheri', 'Worli', 'Thane', 'Navi Mumbai'],
  },
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    landmark: 'Vidhana Soudha',
    policyTitle: 'Karnataka EV Policy',
    policyActiveUntil: '31 December 2028',
    benefits: 'Road Tax Concessions & Registration Exemption',
    dealersCount: '160+ EV Showrooms',
    chargingBaysCount: '2,120+ Active Bays',
    popularSuburbs: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout'],
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    landmark: 'Charminar',
    policyTitle: 'Telangana EV Policy',
    policyActiveUntil: '31 December 2029',
    benefits: '100% Road Tax & Registration Fee Waiver',
    dealersCount: '120+ EV Showrooms',
    chargingBaysCount: '1,420+ Active Bays',
    popularSuburbs: ['Gachibowli', 'Hitec City', 'Jubilee Hills', 'Banjara Hills'],
  },
  pune: {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    landmark: 'Shaniwar Wada',
    policyTitle: 'Maharashtra EV Policy',
    policyActiveUntil: '31 March 2027',
    benefits: '100% Road Tax Exemption & Green Parking Perks',
    dealersCount: '110+ EV Showrooms',
    chargingBaysCount: '1,180+ Active Bays',
    popularSuburbs: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Baner'],
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    landmark: 'Marina Beach',
    policyTitle: 'Tamil Nadu EV Policy',
    policyActiveUntil: '31 December 2027',
    benefits: '100% Road Tax & Registration Fee Waiver',
    dealersCount: '115+ EV Showrooms',
    chargingBaysCount: '1,350+ Active Bays',
    popularSuburbs: ['Adyar', 'Velachery', 'Anna Nagar', 'OMR'],
  },
};

interface CityState {
  activeCityId: string;
  isCityModalOpen: boolean;
  isAutoDetecting: boolean;
  gpsDetectedCityId: string | null;
  activeCity: CityMetadata;
  selectCity: (cityId: string) => void;
  openCityModal: () => void;
  closeCityModal: () => void;
  detectLocationGps: () => Promise<void>;
}

export const useCityStore = create<CityState>()(
  persist(
    (set, get) => ({
      activeCityId: 'delhi-ncr',
      isCityModalOpen: false,
      isAutoDetecting: false,
      gpsDetectedCityId: null,
      activeCity: MEGA_CITIES_DICTIONARY['delhi-ncr'],
      selectCity: (cityId: string) => {
        const cityData = MEGA_CITIES_DICTIONARY[cityId] || MEGA_CITIES_DICTIONARY['delhi-ncr'];
        if (typeof window !== 'undefined') {
          localStorage.setItem('whyev_location_has_set', 'true');
        }
        set({ activeCityId: cityId, activeCity: cityData, isCityModalOpen: false, gpsDetectedCityId: null });
      },
      openCityModal: () => set({ isCityModalOpen: true }),
      closeCityModal: () => set({ isCityModalOpen: false }),
      detectLocationGps: async () => {
        set({ isAutoDetecting: true });
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              const cityCoords = [
                { id: 'delhi-ncr', lat: 28.6139, lng: 77.2090 },
                { id: 'mumbai', lat: 19.0760, lng: 72.8777 },
                { id: 'bengaluru', lat: 12.9716, lng: 77.5946 },
                { id: 'hyderabad', lat: 17.3850, lng: 78.4867 },
                { id: 'pune', lat: 18.5204, lng: 73.8567 },
                { id: 'chennai', lat: 13.0827, lng: 80.2707 },
              ];
              let closestId = 'delhi-ncr';
              let minDistance = Infinity;
              cityCoords.forEach((c) => {
                const d = Math.hypot(c.lat - latitude, c.lng - longitude);
                if (d < minDistance) {
                  minDistance = d;
                  closestId = c.id;
                }
              });
              const cityData = MEGA_CITIES_DICTIONARY[closestId] || MEGA_CITIES_DICTIONARY['delhi-ncr'];
              set({
                activeCityId: closestId,
                activeCity: cityData,
                isAutoDetecting: false,
                isCityModalOpen: true,
                gpsDetectedCityId: closestId,
              });
            },
            () => {
              set({ isAutoDetecting: false, isCityModalOpen: true });
            },
            { timeout: 8000 }
          );
        } else {
          set({ isAutoDetecting: false, isCityModalOpen: true });
        }
      },
    }),
    {
      name: 'whyev-active-city',
      partialize: (state) => ({
        activeCityId: state.activeCityId,
      }),
    }
  )
);

