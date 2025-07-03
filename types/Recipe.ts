export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cuisine: string;
  allergens: string[];
  servings: number;
  nutrition: Record<string, string | number>;
  rating: number;
} 