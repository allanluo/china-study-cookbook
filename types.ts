
export enum GardenCategory {
  FRUITS = 'Fruits',
  GRAINS = 'Grains',
  LEAVES = 'Leaves',
  ROOTS = 'Roots',
  LEGUMES = 'Legumes',
  FLOWERS = 'Flowers',
  NUTS = 'Nuts',
  MUSHROOMS = 'Mushrooms'
}

export type RecipeCourse = 
  | 'All' 
  | 'Breakfast' 
  | 'Appetizers & Salads' 
  | 'Soups' 
  | 'Sandwiches' 
  | 'Entrées' 
  | 'Side Dishes' 
  | 'Desserts';

export interface Recipe {
  id: string;
  name: string;
  course: RecipeCourse;
  categories: GardenCategory[];
  ingredients: string[];
  instructions: string;
  prepTime: number;
  isQuick: boolean;
  healthTip?: string;
  description: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  purchased: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  status: 'stocked' | 'low';
}

export interface DiseaseTrack {
  id: string;
  title: string;
  description: string;
  impact: string;
}
