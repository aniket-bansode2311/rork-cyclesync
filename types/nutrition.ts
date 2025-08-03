export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  servingUnit: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  category?: string;
}

export interface FoodEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  servings: number;
  mealType: MealType;
  date: string; // ISO date string
  userId: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealBreakdown: {
    [key in MealType]: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      entries: FoodEntry[];
    };
  };
}

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface NutritionState {
  entries: FoodEntry[];
  dailySummaries: { [date: string]: NutritionSummary };
  goals: NutritionGoals;
  isLoading: boolean;
  error: string | null;
}