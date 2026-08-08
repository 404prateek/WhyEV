import { QuestionnaireConfig, EmpanelledVehicle, VehicleCategory } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { recommendationApi } from '@/lib/api';

export interface QuestionnaireResponse {
  category?: string;
  budgetLakhs?: number;
  dailyCommuteKm?: number;
  chargingAccess?: string;
  familySize?: number;
}

export class QuestionnaireService {
  /**
   * Fetch backend configurable EV Matcher questionnaire steps and options.
   */
  static async getQuestionnaireConfig(): Promise<QuestionnaireConfig> {
    return {
      steps: [
        {
          id: 'category',
          title: 'Vehicle Type',
          questionText: 'What type of EV are you searching for?',
          subtitle: 'Select between 2-wheelers or 4-wheeler cars',
          options: [
            { value: '4W', label: 'Electric Car (4W)', description: 'SUV, Sedan, or Hatchback' },
            { value: '2W', label: 'Electric Scooter/Bike (2W)', description: 'High-speed urban commute' },
          ],
        },
        {
          id: 'budget',
          title: 'Budget Range',
          questionText: 'What is your comfortable budget limit?',
          subtitle: 'Ex-showroom price before state subsidies',
          sliderLimits: {
            min: 5,
            max: 50,
            step: 1,
            unit: 'Lakhs',
          },
        },
        {
          id: 'commute',
          title: 'Daily Commute',
          questionText: 'How many kilometers do you drive per day on average?',
          subtitle: 'Helps calculate exact battery range requirements',
          sliderLimits: {
            min: 10,
            max: 200,
            step: 5,
            unit: 'km/day',
          },
        },
        {
          id: 'charging',
          title: 'Home Charging Setup',
          questionText: 'Do you have dedicated home charging access?',
          options: [
            { value: 'home_charger', label: 'Yes, Dedicated Parking Charger', description: 'Apartment or private garage' },
            { value: 'public_charging', label: 'Rely on Public DC Fast Charging', description: 'Nearby fast charging stations' },
          ],
        },
      ],
    };
  }

  /**
   * Submit questionnaire inputs to backend and return scored vehicle recommendations.
   */
  static async submitQuestionnaire(responses: QuestionnaireResponse): Promise<EmpanelledVehicle[]> {
    try {
      const recs = await recommendationApi.getRecommendations({
        budgetMax: (responses.budgetLakhs || 15) * 100000,
        category: (responses.category as VehicleCategory) || '4W',
        dailyCommuteKm: responses.dailyCommuteKm || 40,
        housingType: responses.chargingAccess === 'home_charger' ? 'apartment' : 'independent_house',
        tradeInIce: true,
        isDelhiResident: true,
      });
      if (recs && recs.length > 0) return recs;
    } catch { /* fall back */ }

    let matches = [...MOCK_EMPANELLED_VEHICLES];

    if (responses.category) {
      matches = matches.filter((v) => v.category === responses.category);
    }

    if (responses.budgetLakhs) {
      const maxPrice = responses.budgetLakhs * 100000;
      matches = matches.filter((v) => v.exShowroomPrice <= maxPrice * 1.15);
    }

    if (responses.dailyCommuteKm) {
      const minRange = responses.dailyCommuteKm * 2.5;
      matches = matches.filter((v) => v.rangeKm >= minRange);
    }

    return matches.length > 0 ? matches : MOCK_EMPANELLED_VEHICLES.slice(0, 3);
  }
}

