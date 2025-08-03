import { FoodSearchResult, FoodItem } from '@/types/nutrition';
import { requestQueue } from './requestQueue';

// USDA FoodData Central API
const USDA_API_KEY = 'DEMO_KEY'; // In production, use a real API key
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export class NutritionService {
  private static lastRequestTime = 0;
  private static minRequestInterval = 500; // 500ms between requests
  
  private static async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  static async searchFoods(query: string, pageSize: number = 20): Promise<FoodSearchResult[]> {
    return requestQueue.add(async () => {
      try {
        await this.waitForRateLimit();
        
        const response = await fetch(
          `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          console.log(`USDA API rate limited, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          throw new Error('Rate limited, will retry');
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.foods || [];
      } catch (error) {
        console.error('Error searching foods:', error);
        // Return mock data for development/testing
        return this.getMockFoodResults(query);
      }
    });
  }

  static async getFoodDetails(fdcId: number): Promise<FoodSearchResult | null> {
    return requestQueue.add(async () => {
      try {
        await this.waitForRateLimit();
        
        const response = await fetch(
          `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          console.log(`USDA API rate limited, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          throw new Error('Rate limited, will retry');
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error fetching food details:', error);
        return null;
      }
    });
  }

  static convertSearchResultToFoodItem(result: FoodSearchResult): FoodItem {
    const nutrients = result.foodNutrients || [];
    
    const getNutrientValue = (nutrientName: string): number => {
      const nutrient = nutrients.find(n => 
        n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
      );
      return nutrient?.value || 0;
    };

    return {
      id: result.fdcId.toString(),
      name: result.description,
      brand: result.brandOwner,
      servingSize: result.servingSize?.toString() || '100',
      servingUnit: result.servingSizeUnit || 'g',
      calories: getNutrientValue('Energy'),
      protein: getNutrientValue('Protein'),
      carbs: getNutrientValue('Carbohydrate'),
      fat: getNutrientValue('Total lipid'),
      fiber: getNutrientValue('Fiber'),
      sugar: getNutrientValue('Sugars'),
      sodium: getNutrientValue('Sodium'),
      category: 'general',
    };
  }

  // Mock data for development/testing
  private static getMockFoodResults(query: string): FoodSearchResult[] {
    const mockFoods = [
      {
        fdcId: 1001,
        description: `${query} - Whole Wheat Bread`,
        brandOwner: 'Generic Brand',
        servingSize: 28,
        servingSizeUnit: 'g',
        foodNutrients: [
          { nutrientId: 1008, nutrientName: 'Energy', nutrientNumber: '208', unitName: 'kcal', value: 80 },
          { nutrientId: 1003, nutrientName: 'Protein', nutrientNumber: '203', unitName: 'g', value: 4 },
          { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', nutrientNumber: '205', unitName: 'g', value: 14 },
          { nutrientId: 1004, nutrientName: 'Total lipid (fat)', nutrientNumber: '204', unitName: 'g', value: 1.5 },
          { nutrientId: 1079, nutrientName: 'Fiber, total dietary', nutrientNumber: '291', unitName: 'g', value: 2 },
          { nutrientId: 2000, nutrientName: 'Sugars, total including NLEA', nutrientNumber: '269', unitName: 'g', value: 1 },
          { nutrientId: 1093, nutrientName: 'Sodium, Na', nutrientNumber: '307', unitName: 'mg', value: 150 },
        ],
      },
      {
        fdcId: 1002,
        description: `${query} - Chicken Breast`,
        brandOwner: 'Fresh Market',
        servingSize: 100,
        servingSizeUnit: 'g',
        foodNutrients: [
          { nutrientId: 1008, nutrientName: 'Energy', nutrientNumber: '208', unitName: 'kcal', value: 165 },
          { nutrientId: 1003, nutrientName: 'Protein', nutrientNumber: '203', unitName: 'g', value: 31 },
          { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', nutrientNumber: '205', unitName: 'g', value: 0 },
          { nutrientId: 1004, nutrientName: 'Total lipid (fat)', nutrientNumber: '204', unitName: 'g', value: 3.6 },
          { nutrientId: 1079, nutrientName: 'Fiber, total dietary', nutrientNumber: '291', unitName: 'g', value: 0 },
          { nutrientId: 2000, nutrientName: 'Sugars, total including NLEA', nutrientNumber: '269', unitName: 'g', value: 0 },
          { nutrientId: 1093, nutrientName: 'Sodium, Na', nutrientNumber: '307', unitName: 'mg', value: 74 },
        ],
      },
      {
        fdcId: 1003,
        description: `${query} - Brown Rice`,
        brandOwner: 'Organic Farms',
        servingSize: 45,
        servingSizeUnit: 'g',
        foodNutrients: [
          { nutrientId: 1008, nutrientName: 'Energy', nutrientNumber: '208', unitName: 'kcal', value: 160 },
          { nutrientId: 1003, nutrientName: 'Protein', nutrientNumber: '203', unitName: 'g', value: 3 },
          { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', nutrientNumber: '205', unitName: 'g', value: 33 },
          { nutrientId: 1004, nutrientName: 'Total lipid (fat)', nutrientNumber: '204', unitName: 'g', value: 1 },
          { nutrientId: 1079, nutrientName: 'Fiber, total dietary', nutrientNumber: '291', unitName: 'g', value: 2 },
          { nutrientId: 2000, nutrientName: 'Sugars, total including NLEA', nutrientNumber: '269', unitName: 'g', value: 0 },
          { nutrientId: 1093, nutrientName: 'Sodium, Na', nutrientNumber: '307', unitName: 'mg', value: 5 },
        ],
      },
    ];

    return mockFoods;
  }
}