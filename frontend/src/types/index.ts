export type VehicleCategory = '2W' | '3W' | '4W';

export interface EmpanelledVehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  category: VehicleCategory;
  exShowroomPrice: number;
  effectivePrice: number;
  subsidyAmount: number;
  scrappageBonus: number;
  rangeKm: number;
  batteryCapacityKwh: number;
  empanelledStatus: boolean;
  chargingTimeHours: number;
  topSpeedKmvh: number;
  features: string[];
  imageUrl: string;
  whyThisFits: string;
  runningCostPerKm: number; // in INR
}

export interface SubsidyRule {
  policyVersion: string; // e.g. "Delhi EV Policy 2026"
  category: VehicleCategory;
  yearTier: 1 | 2 | 3;
  incentivePerKwh: number;
  maxCapAmount: number;
  scrappageBonusAmount: number;
  roadTaxWaiverPct: number;
  registrationFeeWaiver: boolean;
  priceCeiling: number;
  effectiveFrom: string;
  effectiveTo: string;
}

export type ApplicationStatus = 'calculated' | 'documents_pending' | 'submitted' | 'disbursed';

export interface SubsidyApplication {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleModelName: string;
  rcIssueDate?: string;
  filingDeadline: string; // Day 30 post RC
  status: ApplicationStatus;
  calculatedSubsidy: number;
  scrappageBonus: number;
  taxWaiverEstimated: number;
  totalBenefit: number;
  submittedAt?: string;
  disbursedAt?: string;
  daysRemaining: number;
}

export interface Dealer {
  id: string;
  name: string;
  brand: string;
  address: string;
  locality: string;
  city: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  empanelledModels: string[];
  phone: string;
  email: string;
  isVerified: boolean;
  hasInventoryLive: boolean;
  exclusiveOffer?: string;
}

export interface BatteryReport {
  id: string;
  vehicleId: string;
  makeModel: string;
  year: number;
  odometerKm: number;
  inspectionDate: string;
  batteryScore: number; // 0 - 100
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Requires Service';
  estimatedRemainingYears: number;
  degradationPct: number;
  chargingCycleCount: number;
  certificateValidUntil: string;
  qrCodeUrl: string;
  inspectorName: string;
}

export interface DealerLead {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  dealerId: string;
  dealerName: string;
  vehicleId: string;
  vehicleName: string;
  status: 'new' | 'contacted' | 'test_drive_scheduled' | 'converted';
  sourceModule: 'recommendation_flow' | 'subsidy_flow';
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  dealerId: string;
  dealerName: string;
  vehicleId?: string;
  vehicleName?: string;
  type: 'test_drive' | 'battery_inspection';
  scheduledAt: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  isDelhiResident: boolean;
  housingType: 'apartment' | 'independent_house';
  hasAssignedParking: boolean;
  hasHomeCharger: boolean;
  dailyCommuteKm: number;
  budgetMin: number;
  budgetMax: number;
  familySize: number;
  preferredCategory: VehicleCategory;
  tradeInIceVehicle: boolean;
  profileCompletionPct: number;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentType?: 'Profile' | 'Eligibility' | 'Financial' | 'Recommendation' | 'Dealer' | 'FollowUp' | 'Orchestrator';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionKey: string }[];
}
