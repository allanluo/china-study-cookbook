
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
  Cloud,
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
  // --- BREAKFAST ---
  {
    id: 'REC_001', name: 'Banana Crumb Muffins', course: 'Breakfast', prepTime: 15, isQuick: true,
    description: 'Sweetened with ripe bananas and Sucanat.',
    categories: mapTags(['Fruit', 'Grain', 'Nut']),
    ingredients: ['Whole wheat pastry flour', 'Baking powder/soda', 'Cinnamon', 'Ripe bananas', 'Nondairy milk', 'Walnuts', 'Sucanat', 'Raw oats'],
    instructions: 'Preheat oven to 375°F. Mix dry ingredients in a large bowl. Separately mashing bananas with milk. Combine wet and dry ingredients. Add walnuts. Top with cinnamon and oats. Bake for 18-20 mins until golden.',
    healthTip: 'Complex carbohydrates in their natural state are extremely good for you.'
  },
  {
    id: 'REC_002', name: 'Blackberry Lemon Tea Cakes', course: 'Breakfast', prepTime: 10, isQuick: true,
    description: 'Refreshing citrus tea cakes with fresh blackberries.',
    categories: mapTags(['Fruit', 'Grain', 'Legume', 'Nut']),
    ingredients: ['Whole wheat pastry flour', 'Sucanat', 'Lemon zest', 'Soy yogurt', 'Almond milk', 'Lemon juice', 'Flax egg', 'Blackberries'],
    instructions: 'Combine flour, Sucanat, and zest. Mix wet ingredients including flax egg. Fold in berries gently. Bake at 350°F for 45 mins in a non-stick pan.'
  },
  {
    id: 'REC_003', name: 'Easy Pumpkin Muffins', course: 'Breakfast', prepTime: 10, isQuick: true,
    description: 'Spiced pumpkin treats for any morning.',
    categories: mapTags(['Fruit', 'Grain', 'Nut', 'Root']),
    ingredients: ['Whole wheat flour', 'Pumpkin puree', 'Applesauce', 'Ginger', 'Nutmeg', 'Allspice', 'Walnuts'],
    instructions: 'Mix dry ingredients. Add pumpkin, water, applesauce, and nuts. Stir until just mixed. Fill muffin cups. Bake 25-30 mins.'
  },
  {
    id: 'REC_005', name: 'Blueberry Buckwheat Pancakes', course: 'Breakfast', prepTime: 15, isQuick: true,
    description: 'Hearty buckwheat pancakes bursting with antioxidants.',
    categories: mapTags(['Fruit', 'Grain']),
    ingredients: ['Buckwheat flour', 'Oat flour', 'Baking powder', 'Soy milk', 'Maple syrup', 'Fresh blueberries'],
    instructions: 'Whisk flours and baking powder. Add soy milk and syrup. Fold in blueberries. Cook on a non-stick griddle until bubbles form. Flip and cook until golden.'
  },
  {
    id: 'REC_006', name: 'Apple Cinnamon Oatmeal', course: 'Breakfast', prepTime: 5, isQuick: true,
    description: 'A classic morning fuel with fresh fruit.',
    categories: mapTags(['Fruit', 'Grain']),
    ingredients: ['Steel cut oats', 'Water', 'Diced apples', 'Cinnamon', 'Ground flaxseeds'],
    instructions: 'Bring water to a boil. Add oats and reduce heat. Simmer for 20 mins. Stir in apples and cinnamon. Top with flaxseeds before serving.'
  },

  // --- APPETIZERS & SALADS ---
  {
    id: 'REC_021', name: 'Best Broccoli Salad', course: 'Appetizers & Salads', prepTime: 15, isQuick: true,
    description: 'Nutrient-rich salad with a creamy WFPB dressing.',
    categories: mapTags(['Flower', 'Fruit', 'Grain', 'Nut', 'Root']),
    ingredients: ['Fresh broccoli', 'Dried cranberries', 'Red onion', 'Walnuts', 'Rice vinegar', 'Green Garden Mayo'],
    instructions: 'Cut broccoli into bite-sized florets. Mix with cranberries, onions, and walnuts. Whisk dressing and toss. Chill for 2 hours for best flavor.',
    healthTip: 'One cup of broccoli has more vitamin C than an orange!'
  },
  {
    id: 'REC_028', name: 'Ensalada Azteca', course: 'Appetizers & Salads', prepTime: 25, isQuick: false,
    description: 'A diversity-focused meal in a bowl.',
    categories: mapTags(['Fruit', 'Grain', 'Leaf', 'Legume', 'Root']),
    ingredients: ['Black beans', 'Quinoa', 'Mango', 'Avocado', 'Jalapeño', 'Cilantro', 'Rice vinegar'],
    instructions: 'Combine beans, quinoa, and chopped vegetables in a bowl. Process mango-lime-ginger dressing in a blender. Toss gently and serve immediately.'
  },
  {
    id: 'REC_029', name: 'Kale and White Bean Salad', course: 'Appetizers & Salads', prepTime: 15, isQuick: true,
    description: 'Massaged kale with creamy cannellini beans.',
    categories: mapTags(['Leaf', 'Legume', 'Root']),
    ingredients: ['Lacinato kale', 'Cannellini beans', 'Lemon juice', 'Garlic', 'Nutritional yeast'],
    instructions: 'Remove stems from kale and chop finely. Massage with lemon juice until softened. Add beans, minced garlic, and nutritional yeast. Toss well.'
  },

  // --- SOUPS ---
  {
    id: 'REC_039', name: 'Aztec Soup', course: 'Soups', prepTime: 20, isQuick: true,
    description: 'Spicy black bean soup with fresh avocado salsa.',
    categories: mapTags(['Fruit', 'Grain', 'Leaf', 'Legume', 'Root']),
    ingredients: ['Black beans', 'Corn', 'Vegetable broth', 'Cumin', 'Smoked paprika', 'Avocado', 'Cilantro'],
    instructions: 'Sauté onion and garlic in a splash of broth. Simmer beans, corn, and spices for 10 mins. Serve hot topped with fresh avocado salsa.'
  },
  {
    id: 'REC_045', name: 'Quick Three-Bean Soup', course: 'Soups', prepTime: 10, isQuick: true,
    description: 'Convenient and fiber-dense.',
    categories: mapTags(['Fruit', 'Grain', 'Leaf', 'Legume', 'Root']),
    ingredients: ['Black beans', 'Kidney beans', 'Chickpeas', 'Crushed tomatoes', 'Smoked paprika', 'Oregano'],
    instructions: 'Sauté onion and garlic in a pot. Add all beans, tomatoes, and herbs. Simmer for 30 minutes to let flavors meld.',
    healthTip: 'Fiber protects against colon cancer. Aim for 10g extra daily.'
  },
  {
    id: 'REC_046', name: 'Lentil Vegetable Soup', course: 'Soups', prepTime: 15, isQuick: true,
    description: 'A protein-packed hearty classic.',
    categories: mapTags(['Legume', 'Root', 'Leaf']),
    ingredients: ['Brown lentils', 'Carrots', 'Celery', 'Vegetable broth', 'Bay leaf', 'Thyme'],
    instructions: 'Rinse lentils. Sauté carrots and celery in broth. Add lentils, broth, and herbs. Simmer for 45 mins until lentils are tender.'
  },

  // --- SANDWICHES ---
  {
    id: 'REC_052', name: 'Spinach Chickpea Burgers', course: 'Sandwiches', prepTime: 20, isQuick: false,
    description: 'Whole-food patties that hold together beautifully.',
    categories: mapTags(['Fruit', 'Grain', 'Leaf', 'Legume', 'Root']),
    ingredients: ['Chickpeas', 'Frozen spinach', 'Oats', 'Flaxseed meal', 'Vital wheat gluten', 'Tomato paste'],
    instructions: 'Pulse vegetables in food processor. Mix with mashed beans, oats, and gluten in a bowl. Form into patties. Bake at 375°F for 25 mins per side.'
  },
  {
    id: 'REC_053', name: 'Hummus Veggie Wrap', course: 'Sandwiches', prepTime: 10, isQuick: true,
    description: 'A quick and fresh lunch option.',
    categories: mapTags(['Grain', 'Legume', 'Leaf', 'Root']),
    ingredients: ['Whole wheat tortilla', 'Oil-free hummus', 'Cucumber', 'Bell pepper', 'Sprouts'],
    instructions: 'Spread hummus over the tortilla. Layer with sliced cucumber, peppers, and sprouts. Roll up tightly and cut in half.'
  },

  // --- ENTRÉES ---
  {
    id: 'REC_061', name: 'Veggie Fajita Wraps', course: 'Entrées', prepTime: 25, isQuick: true,
    description: 'A rainbow of sautéed peppers and mushrooms.',
    categories: mapTags(['Flower', 'Fruit', 'Grain', 'Leaf', 'Legume', 'Mushroom', 'Nut', 'Root']),
    ingredients: ['Peppers', 'Broccoli', 'Mushrooms', 'Avocado', 'Tortillas', 'Salsa'],
    instructions: 'Water sauté garlic and onion until translucent. Add peppers, broccoli, and mushrooms. Season with lemon pepper. Serve in warm tortillas with avocado.',
    healthTip: 'Antioxidants are why colorful foods are nutrient-rich.'
  },
  {
    id: 'REC_079', name: 'Pumpkin Gnocchi', course: 'Entrées', prepTime: 25, isQuick: false,
    description: 'Delicate pumpkin pillows in zucchini sauce.',
    categories: mapTags(['Fruit', 'Grain', 'Leaf', 'Root']),
    ingredients: ['Pumpkin puree', 'Pastry flour', 'Zucchini', 'Diced tomatoes', 'Basil', 'Oregano'],
    instructions: 'Mix pumpkin and flour to make soft dough. Roll into ropes and cut into small pieces. Boil in water until floating. Serve with a fresh sautéed vegetable sauce.'
  },
  {
    id: 'REC_080', name: 'Sweet Potato Chili', course: 'Entrées', prepTime: 20, isQuick: true,
    description: 'Thick and comforting sweet potato chili.',
    categories: mapTags(['Root', 'Legume', 'Fruit']),
    ingredients: ['Sweet potatoes', 'Black beans', 'Diced tomatoes', 'Chili powder', 'Onion'],
    instructions: 'Sauté onion in water. Add diced sweet potatoes, beans, tomatoes, and spices. Cover and simmer for 30 mins until potatoes are soft.'
  },
  {
    id: 'REC_088', name: 'Mushroom Risotto', course: 'Entrées', prepTime: 40, isQuick: false,
    description: 'Creamy oil-free risotto with umami-rich mushrooms.',
    categories: mapTags(['Grain', 'Mushroom', 'Root']),
    ingredients: ['Arborio rice', 'Mixed mushrooms', 'Vegetable broth', 'Garlic', 'Parsley'],
    instructions: 'Sauté mushrooms and garlic. Add rice and stir. Add broth one ladle at a time, stirring constantly until absorbed. Continue until rice is creamy.'
  },

  // --- SIDE DISHES ---
  {
    id: 'REC_094', name: 'Creamed Cauliflower', course: 'Side Dishes', prepTime: 20, isQuick: true,
    description: 'A rich, oil-free alternative to mashed potatoes.',
    categories: mapTags(['Flower', 'Fruit', 'Nut']),
    ingredients: ['Cauliflower', 'Cashews', 'Nutritional yeast', 'Miso', 'Tahini'],
    instructions: 'Steam or boil cauliflower until very soft. Blend cashews and sauce ingredients with a little water. Pulse together with cauliflower for a creamy texture.'
  },
  {
    id: 'REC_095', name: 'Roasted Brussels Sprouts', course: 'Side Dishes', prepTime: 10, isQuick: true,
    description: 'Crispy sprouts with balsamic glaze.',
    categories: mapTags(['Leaf', 'Fruit']),
    ingredients: ['Brussels sprouts', 'Balsamic vinegar', 'Maple syrup', 'Garlic powder'],
    instructions: 'Halve the sprouts. Toss with vinegar and spices. Roast at 400°F on a silicone mat for 25 mins until edges are crispy.'
  },

  // --- DESSERTS ---
  {
    id: 'REC_112', name: 'Mint Chocolate Pudding', course: 'Desserts', prepTime: 7, isQuick: true,
    description: 'Velvety cashews and cocoa.',
    categories: mapTags(['Nut']),
    ingredients: ['Cashews', 'Cocoa powder', 'Maple syrup', 'Mint extract', 'Xanthan gum'],
    instructions: 'Process all ingredients in a high-speed blender until completely smooth. Chill in the refrigerator for at least 2 hours before serving.',
    healthTip: 'Cocoa powder is much healthier than processed baker\'s chocolate.'
  },
  {
    id: 'REC_113', name: 'Fruit Sorbet', course: 'Desserts', prepTime: 5, isQuick: true,
    description: 'Instant healthy frozen treat.',
    categories: mapTags(['Fruit']),
    ingredients: ['Frozen mango', 'Frozen raspberries', 'Splash of orange juice'],
    instructions: 'Add frozen fruit to a food processor. Add juice slowly while processing until the mixture reaches a smooth, soft-serve consistency.'
  }
];

export const DISEASE_TRACKS: DiseaseTrack[] = [
  {
    id: 'heart',
    title: 'Heart Health',
    description: 'Reverse plaque through zero-cholesterol whole plants.',
    impact: 'WFPB diets eliminate dietary cholesterol and reduce saturated fat intake significantly.'
  },
  {
    id: 'cancer',
    title: 'Cancer Prevention',
    description: 'Lower risk through fiber and cruciferous intake.',
    impact: 'Dietary fiber lowers colon cancer risk. Cruciferous veg regulate protective hormones.'
  },
  {
    id: 'diabetes',
    title: 'Diabetes Control',
    description: 'Stabilize insulin with complex carbohydrates.',
    impact: 'Natural plant starches prevent the insulin spikes caused by processed sugars and white flours.'
  }
];

export const PRESERVATION_RULES = [
  {
    item: "Corn",
    rule: "Chill immediately.",
    reason: "Loses 50% of sweetness in 1 day at room temp."
  },
  {
    item: "Asparagus",
    rule: "Refrigerate.",
    reason: "Loses 50% of Vitamin C in 2 days at room temp."
  },
  {
    item: "Greens/Grains",
    rule: "Store in Dark.",
    reason: "Riboflavin (Vitamin B2) is destroyed by light exposure."
  }
];
