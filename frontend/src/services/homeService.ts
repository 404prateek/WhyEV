import { HomeData } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

export class HomeService {
  /**
   * Fetch complete homepage dynamic data payload from backend API response.
   */
  static async getHomeData(): Promise<HomeData> {
    return {
      heroSlides: [
        {
          id: 'slide-1',
          title: 'Discover Your Perfect EV Match',
          subtitle: 'Empowering India’s transition to electric mobility with zero-bias recommendations, direct subsidy calculations, and NABL battery certification.',
          badge: 'PM E-DRIVE 2026 Ready',
          ctaText: 'Start EV Matcher',
          ctaUrl: '/recommend',
          bgImage: '/explore/curvv-ev-desktop.png',
        },
        {
          id: 'slide-2',
          title: 'Calculate Direct State Subsidies',
          subtitle: 'Instantly compute state & central EV incentives, road tax waivers, and total cost of ownership savings.',
          badge: 'Instant Subsidy Calculator',
          ctaText: 'Calculate Subsidies',
          ctaUrl: '/subsidy',
          bgImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1600&auto=format&fit=crop&q=80',
        },
      ],
      featuredVehicles: MOCK_EMPANELLED_VEHICLES.slice(0, 4),
      exploreBrands: [
        { id: 'brand-tata', name: 'Tata Motors', vehicleCount: 6, logoUrl: '/explore/curvv-ev-desktop.png' },
        { id: 'brand-mg', name: 'MG Motor', vehicleCount: 4, logoUrl: '/explore/windsor-ev.jpg' },
        { id: 'brand-mahindra', name: 'Mahindra Electric', vehicleCount: 3 },
        { id: 'brand-byd', name: 'BYD India', vehicleCount: 3 },
        { id: 'brand-hyundai', name: 'Hyundai', vehicleCount: 2 },
      ],
      popularSearches: [
        'Electric SUV under 15 Lakhs',
        'Tata Curvv EV Range Test',
        'Delhi EV Policy Direct Subsidy',
        'DC Fast Chargers Near Me',
        'Used EV Battery SOH Verification',
      ],
      testimonials: [
        {
          id: 'test-1',
          name: 'Vikram Mehta',
          city: 'New Delhi',
          vehicleOwned: 'Tata Nexon EV Max',
          text: 'WhyEV helped me claim the ₹1.5L Delhi state subsidy and book a doorstep battery health verification before purchasing my pre-owned EV.',
        },
        {
          id: 'test-2',
          name: 'Ananya Roy',
          city: 'Bengaluru',
          vehicleOwned: 'MG Windsor EV',
          text: 'The EV Matcher questionnaire correctly identified that my 50km daily commute saved ₹8,400 monthly over my old petrol car!',
        },
      ],
    };
  }
}
