import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, EmpanelledVehicle, VehicleCategory, AiChatMessage, SubsidyApplication } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { aiAgentApi } from '@/lib/api';

// --- 1. AUTH STORE WITH PERSISTENCE & MODAL CONTROL ---
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  targetRedirectUrl: string | null;
  isPermissionModalOpen: boolean;
  activePermissionRequest: 'location' | 'notifications' | 'camera' | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: (redirectUrl?: string) => void;
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
      isPermissionModalOpen: false,
      activePermissionRequest: null,
      login: (user) => set({ user, isAuthenticated: true, isAuthModalOpen: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      openAuthModal: (redirectUrl) => set({ isAuthModalOpen: true, targetRedirectUrl: redirectUrl || null }),
      closeAuthModal: () => set({ isAuthModalOpen: false, targetRedirectUrl: null }),
      requestPermission: (perm) => set({ isPermissionModalOpen: true, activePermissionRequest: perm }),
      closePermissionModal: () => set({ isPermissionModalOpen: false, activePermissionRequest: null }),
    }),
    {
      name: 'whyev-auth-session-v2',
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
  shortlist: [],
  savedVehicleIds: ['veh-4w-tatanexonev'],
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
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
  isDelhiResident: boolean;
  batteryCapacityKwh: number;
  hasScrappage: boolean;
  calculatedIncentive: number;
  scrappageIncentive: number;
  taxWaiverIncentive: number;
  totalBenefit: number;
  // For PDF modal: real vehicle info from last calculation
  selectedVehicleLabel: string;
  selectedVehicleVariant: string;
  selectedCity: string;
  selectedCategory: string;
  isPdfModalOpen: boolean;
  setPdfModalOpen: (open: boolean) => void;
  updateCalculation: (
    incentive: number,
    scrappage: number,
    tax: number,
    total: number,
    vehicleLabel: string,
    vehicleVariant: string,
    city: string,
    category: string
  ) => void;
}

export const useSubsidyStore = create<SubsidyState>((set) => ({
  isDelhiResident: true,
  batteryCapacityKwh: 40.5,
  hasScrappage: false,
  calculatedIncentive: 0,
  scrappageIncentive: 0,
  taxWaiverIncentive: 0,
  totalBenefit: 0,
  selectedVehicleLabel: '',
  selectedVehicleVariant: '',
  selectedCity: 'Delhi',
  selectedCategory: '4W',
  isPdfModalOpen: false,
  setPdfModalOpen: (open) => set({ isPdfModalOpen: open }),
  updateCalculation: (incentive, scrappage, tax, total, vehicleLabel, vehicleVariant, city, category) =>
    set({
      calculatedIncentive: incentive,
      scrappageIncentive: scrappage,
      taxWaiverIncentive: tax,
      totalBenefit: total,
      selectedVehicleLabel: vehicleLabel,
      selectedVehicleVariant: vehicleVariant,
      selectedCity: city,
      selectedCategory: category,
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
      agentType: 'Voltu',
      text: 'Namaste! 👋 I am Voltu, your WhyEV AI Assistant. I can help calculate your exact Delhi 2026 subsidy, shortlist empanelled EVs for your daily commute, or connect you with verified dealers.',
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

    const agentMsgId = `msg-agent-${Date.now()}`;
    const initialAgentMsg: AiChatMessage = {
      id: agentMsgId,
      sender: 'agent',
      agentType: 'Voltu',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, initialAgentMsg],
      isThinking: true,
    }));

    try {
      await aiAgentApi.sendMessage(get().messages, text, (chunkText) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === agentMsgId ? { ...m, text: chunkText } : m
          ),
          isThinking: false, // Turn off thinking as soon as first chunk arrives
        }));
      });
      set({ isThinking: false });
    } catch {
      set({ isThinking: false });
    }
  },
}));
