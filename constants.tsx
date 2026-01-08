
import React from 'react';
import { GardenCategory, Recipe, DiseaseTrack } from './types';
import { 
  Apple, 
  Wheat, 
  Leaf, 
  Carrot, 
  Bean, 
  Flower2, 
  Nut, 
  Cloud 
} from 'lucide-react';

export const CATEGORY_ICONS: Record<GardenCategory, React.ReactNode> = {
  [GardenCategory.FRUITS]: <Apple className="w-6 h-6" />,
  [GardenCategory.GRAINS]: <Wheat className="w-6 h-6" />,
  [GardenCategory.LEAVES]: <Leaf className="w-6 h-6" />,
  [GardenCategory.ROOTS]: <Carrot className="w-6 h-6" />,
  [GardenCategory.LEGUMES]: <Bean className="w-6 h-6" />,
  [GardenCategory.FLOWERS]: <Flower2 className="w-6 h-6" />,
  [GardenCategory.NUTS]: <Nut className="w-6 h-6" />,
  [GardenCategory.MUSHROOMS]: <Cloud className="w-6 h-6" />,
};

export const CATEGORY_COLORS: Record<GardenCategory, string> = {
  [GardenCategory.FRUITS]: 'bg-red-100 text-red-600 border-red-200',
  [GardenCategory.GRAINS]: 'bg-amber-100 text-amber-600 border-amber-200',
  [GardenCategory.LEAVES]: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  [GardenCategory.ROOTS]: 'bg-orange-100 text-orange-600 border-orange-200',
  [GardenCategory.LEGUMES]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  [GardenCategory.FLOWERS]: 'bg-purple-100 text-purple-600 border-purple-200',
  [GardenCategory.NUTS]: 'bg-yellow-800/10 text-yellow-800 border-yellow-200',
  [GardenCategory.MUSHROOMS]: 'bg-stone-100 text-stone-600 border-stone-200',
};

export const FEATURED_SWAPS = [
  { label: 'Eggs (Baking)', icon: '🥚' },
  { label: 'Cooking Oil', icon: '🫗' },
  { label: 'White Sugar', icon: '🍬' },
  { label: 'Butter', icon: '🧈' },
  { label: 'Cow\'s Milk', icon: '🥛' },
  { label: 'Mayonnaise', icon: '🧴' },
];

const mapTags = (tags: string[]): GardenCategory[] => {
  const map: Record<string, GardenCategory> = {
    'Fruit': GardenCategory.FRUITS,
    'Grain': GardenCategory.GRAINS,
    'Leaf': GardenCategory.LEAVES,
    'Root': GardenCategory.ROOTS,
    'Legume': GardenCategory.LEGUMES,
    'Flower': GardenCategory.FLOWERS,
    'Nut': GardenCategory.NUTS,
    'Mushroom': GardenCategory.MUSHROOMS
  };
  return tags.map(t => map[t]).filter(Boolean);
};

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'REC_001',
    name: 'Banana Crumb Muffins',
    course: 'Breakfast',
    prepTime: 15,
    isQuick: true,
    description: 'Sweetened with ripe bananas and Sucanat.',
    categories: mapTags(['Fruit', 'Grain', 'Nut']),
    ingredients: ['Whole wheat pastry flour', 'Baking powder', 'Baking soda', 'Cinnamon', 'Salt', 'Ripe bananas', 'Nondairy milk', 'Vanilla extract', 'Walnuts', 'Sucanat', 'Raw oats'],
    instructions: 'Preheat oven to 375°F. Mix dry ingredients in a large bowl. Separately mash bananas with milk and vanilla. Combine wet and dry. Add walnuts. Top with cinnamon and oats. Bake for 18-20 mins.',
    healthTip: 'Complex carbohydrates in their natural state are extremely good for you.',
    tracks: ['diabetes', 'cancer']
  },
  {
    id: 'REC_061',
    name: 'Veggie Fajita Wraps',
    course: 'Entrées',
    prepTime: 25,
    isQuick: true,
    description: 'A rainbow of sautéed peppers and mushrooms.',
    categories: mapTags(['Flower', 'Fruit', 'Grain', 'Leaf', 'Legume', 'Mushroom', 'Nut', 'Root']),
    ingredients: ['Onion', 'Garlic', 'Bell peppers', 'Broccoli', 'Mushrooms', 'Zucchini', 'Corn', 'Black beans', 'Tortillas', 'Avocado', 'Salsa', 'Lemon pepper'],
    instructions: 'Water sauté garlic and onion. Add peppers, broccoli, and mushrooms. Season with lemon pepper. Serve in warm tortillas with avocado and salsa.',
    healthTip: 'Antioxidants are why colorful foods are nutrient-rich.',
    tracks: ['heart', 'cancer', 'diabetes']
  }
];

export const DISEASE_TRACKS: DiseaseTrack[] = [
  {
    id: 'heart',
    title: 'Heart Health',
    description: 'Focus on zero-cholesterol fiber sources to reverse arterial plaque.',
    impact: 'WFPB diets eliminate dietary cholesterol and reduce saturated fat intake significantly.'
  },
  {
    id: 'cancer',
    title: 'Cancer Prevention',
    description: 'Maximize antioxidant and fiber intake to lower cellular oxidative stress.',
    impact: 'Dietary fiber lowers colon cancer risk. Cruciferous veg regulate protective hormones.'
  },
  {
    id: 'diabetes',
    title: 'Diabetes Control',
    description: 'Stabilize blood sugar through complex, high-fiber carbohydrates.',
    impact: 'Natural plant starches prevent the insulin spikes caused by processed sugars.'
  }
];

export const PRESERVATION_RULES = [
  { item: "Corn", rule: "Chill immediately.", reason: "Loses 50% of sweetness in 1 day at room temp." },
  { item: "Asparagus", rule: "Refrigerate.", reason: "Loses 50% of Vitamin C in 2 days at room temp." }
];
