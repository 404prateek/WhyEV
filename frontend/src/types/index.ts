export type VehicleCategory = '2W' | '3W' | '4W';
export type EmpanelledStatus = 'unverified' | 'confirmed' | 'verified' | 'not_empanelled';
export type VehicleAvailability = 'available' | 'being_phased_out' | 'upcoming' | 'available_may_be_discontinued';

export interface VehicleVariant {
  id: string;
  name: string;
  exShowroomPrice: number;
  batteryCapacityKwh: number;
  claimedRangeKm: number;
  features: string[];
}

export interface VehicleColorOption {
  name: string;
  hexCode: string;
  imageUrl?: string;
}

export interface VehicleFaq {
  question: string;
  answer: string;
}

export interface VehicleReview {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  comment: string;
  date: string;
}

export interface EmpanelledVehicle {
  id: string;
  slug?: string;
  make: string; // Brand (e.g. "Tata Motors", "MG Motor")
  brand?: string;
  model: string;
  variant: string;
  category: VehicleCategory;
  vehicleType?: string; // e.g. "Electric SUV"
  bodyType?: string; // e.g. "SUV", "Hatchback", "Sedan"
  launchYear?: number;
  
  // Images
  imageUrl?: string;
  thumbnail?: string;
  galleryImages?: string[];
  
  // Specifications
  batteryCapacityKwh: number;
  batteryKwhOptions?: number[];
  rangeKm: number; // Claimed Range
  claimedRangeKm?: number;
  rangeKmClaimedOptions?: number[];
  realWorldRangeKm?: number;
  motorPowerKw?: number;
  torqueNm?: number;
  chargingTimeHours: number; // AC charging
  chargingTimeAcHours?: number;
  chargingTimeDcMinutes?: number;
  fastChargingSupport?: boolean;
  topSpeedKmvh: number;
  bootSpaceLiters?: number;
  groundClearanceMm?: number;
  seatingCapacity?: number;
  warranty?: string;
  safetyRating?: number; // 0 - 5 stars
  
  // Financial & Subsidies
  exShowroomPrice: number; // in INR
  priceMinLakh?: number;
  priceMaxLakh?: number;
  estimatedSubsidy?: number;
  subsidyAmount: number;
  scrappageBonus: number;
  effectivePrice: number;
  runningCostPerKm: number; // in INR
  
  // BaaS & Options
  empanelledStatus: EmpanelledStatus | boolean;
  boundaryModel?: boolean;
  boundaryNote?: string;
  baasAvailable?: boolean;
  baasPriceLakh?: number;
  baasRentalPerKm?: any;
  availability?: VehicleAvailability;
  launchNote?: string;
  whyThisFits: string;
  dataSourceDate?: string;
  
  // Dynamic Options
  availableColours?: VehicleColorOption[];
  availableVariants?: VehicleVariant[];
  dealerAvailabilityCount?: number;
  chargingConnector?: string;
  governmentSchemeEligibility?: string[];
  badges?: string[];
  availabilityStatus?: string;
  
  // Features, Pros, Cons, FAQs, Reviews
  specifications?: Record<string, string | number>;
  features: string[];
  pros?: string[];
  cons?: string[];
  faqs?: VehicleFaq[];
  reviews?: VehicleReview[];
  averageRating?: number;
  numberRatings?: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  readTime: string;
  publishedDate: string;
  category: string;
  tags?: string[];
  isFeatured?: boolean;
  relatedArticleIds?: string[];
}

export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  connectorTypes: string[];
  chargingSpeedKw: number;
  availabilityStatus: 'available' | 'busy' | 'offline' | 'under_maintenance';
  workingStatus: string;
  pricingPerKwh: number; // INR
  operatingHours: string;
  amenities: string[];
  images?: string[];
  lastUpdated: string;
}

export interface SubsidyRule {
  policyVersion: string;
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
  filingDeadline: string;
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
  rating: number;
  text: string;
  photos?: string[];
  createdAt: string;
  verifiedInteractionId: string;
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
  imageUrl?: string;
  workingHours?: string;
  inventory?: { model: string; inStock: boolean }[];
}

export interface BatteryReport {
  id: string;
  vehicleId: string;
  makeModel: string;
  year: number;
  odometerKm: number;
  inspectionDate: string;
  batteryScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Requires Service';
  estimatedRemainingYears: number;
  degradationPct: number;
  chargingCycleCount: number;
  certificateValidUntil: string;
  qrCodeUrl: string;
  inspectorName: string;
  batteryCapacityKwh?: number;
  acDcRatio?: string;
  cellDelta?: string;
  resaleImpact?: string;
  warrantyStatus?: string;
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
  savedVehicleIds?: string[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaUrl: string;
  bgImage: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  logoUrl?: string;
  vehicleCount: number;
}

export interface HomeData {
  heroSlides: HeroSlide[];
  featuredVehicles: EmpanelledVehicle[];
  exploreBrands: BrandInfo[];
  popularSearches: string[];
  testimonials: {
    id: string;
    name: string;
    city: string;
    avatarUrl?: string;
    text: string;
    vehicleOwned: string;
  }[];
}

export interface QuestionnaireStepOption {
  value: string;
  label: string;
  description?: string;
  iconName?: string;
}

export interface QuestionnaireStepConfig {
  id: string;
  title: string;
  questionText: string;
  subtitle?: string;
  options?: QuestionnaireStepOption[];
  sliderLimits?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentType?: 'Profile' | 'Eligibility' | 'Financial' | 'Recommendation' | 'Dealer' | 'FollowUp' | 'Orchestrator';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionKey: string }[];
}

export interface QuestionnaireConfig {
  steps: QuestionnaireStepConfig[];
}
