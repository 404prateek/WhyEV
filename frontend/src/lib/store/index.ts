import { create } from 'zustand';
import { UserProfile, EmpanelledVehicle, VehicleCategory, AiChatMessage, SubsidyApplication } from '@/types';
import { MOCK_USER_PROFILE, MOCK_EMPANELLED_VEHICLES, MOCK_SUBSIDY_APPLICATION } from '@/lib/mock-data';
import { aiAgentApi } from '@/lib/api';

// --- 1. AUTH STORE ---
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isPermissionModalOpen: boolean;
  activePermissionRequest: 'location' | 'notifications' | 'camera' | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
  requestPermission: (perm: 'location' | 'notifications' | 'camera') => void;
  closePermissionModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: MOCK_USER_PROFILE,
  isAuthenticated: true,
  isAuthModalOpen: false,
  isPermissionModalOpen: false,
  activePermissionRequest: null,
  login: (user) => set({ user, isAuthenticated: true, isAuthModalOpen: false }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  requestPermission: (perm) => set({ isPermissionModalOpen: true, activePermissionRequest: perm }),
  closePermissionModal: () => set({ isPermissionModalOpen: false, activePermissionRequest: null }),
}));

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
      text: 'Namaste Abhishek! 👋 I am your WhyEV AI Assistant. I can help calculate your exact Delhi 2026 subsidy, shortlist empanelled EVs for your daily commute, or connect you with verified dealers.',
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
