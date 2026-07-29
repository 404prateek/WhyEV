export type VehicleCategory = '2W' | '3W' | '4W' | 'N1_goods';

export type EmpanelledStatus = 'unverified' | 'confirmed' | 'not_empanelled';
export type VehicleAvailability = 'available' | 'being_phased_out' | 'upcoming' | 'available_may_be_discontinued';

export interface EmpanelledVehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  category: VehicleCategory;
  bodyType?: string;
  exShowroomPrice: number;
  priceMinLakh?: number;
  priceMaxLakh?: number;
  effectivePrice: number;
  // --- Subsidy breakdown (Delhi EV Policy 2026) ---
  subsidyAmount: number;       // direct purchase incentive (₹/kWh capped)
  directSubsidy?: number;      // same as subsidyAmount
  scrappageBonus: number;      // scrappage/trade-in bonus (0 if no trade-in)
  roadTaxWaiver?: number;      // road tax amount waived (4% of ex-showroom for 4W)
  freeInsurance?: number;      // 1st-year free insurance value
  freeRcRegistration?: number; // free RC registration fee waived
  totalBenefit?: number;       // grand total of all above
  rangeKm: number;
  rangeKmClaimedOptions?: number[];
  batteryCapacityKwh: number;
  batteryKwhOptions?: number[];
  empanelledStatus: EmpanelledStatus | boolean;
  boundaryModel?: boolean;
  boundaryNote?: string;
  baasAvailable?: boolean;
  baasPriceLakh?: number;
  baasRentalPerKm?: any;
  availability?: VehicleAvailability;
  launchNote?: string;
  chargingTimeHours: number;
  topSpeedKmvh: number;
  features: string[];
  imageUrl?: string;
  whyThisFits: string;
  runningCostPerKm: number; // in INR
  dataSourceDate?: string;
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

export interface SavedSubsidyReport {
  id: string;
  vehicleName: string;
  state: string;
  estimatedSavings: number;
  dateGenerated: string;
  batteryCapacityKwh: number;
  scrappageIncluded: boolean;
  pdfUrl?: string;
}

export interface Review {
  id: string;
  targetType: 'dealer' | 'charging_station';
  targetId: string;
  targetName: string;
  userId: string;
  userName: string;
  userCity: string;
  userAvatar?: string;
  rating: number; // 1 - 5
  text: string;
  photos?: string[];
  createdAt: string;
  verifiedInteractionId: string; // FK to appointment or charging status report (required)
  status: 'pending' | 'published' | 'flagged';
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
  state: string;
  avatarUrl?: string;
  memberSince: string;
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
  savedReports?: SavedSubsidyReport[];
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentType?: 'Profile' | 'Eligibility' | 'Financial' | 'Recommendation' | 'Dealer' | 'FollowUp' | 'Orchestrator' | 'Voltu';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionKey: string }[];
}
