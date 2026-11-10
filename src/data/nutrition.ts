/*
 * Food Checker data — EDIT / EXTEND HERE (or replace with an API later). Same content as the web version.
 * Nutrient values, GI and GL are typical approximations per serving.
 * GL (glycemic load) = GI × available carbs ÷ 100: low ≤ 10, medium 11–19, high ≥ 20.
 */
export type Verdict = 'good' | 'moderate' | 'limit';
export type Food = {
  id: string;
  name: string;
  serving: string;
  categories: string[];
  verdict: Verdict;
  tags: string[];
  nutrients: { kcal: number; carbs: number; fiber: number; protein: number; fat: number; sugar: number };
  gi: string;
  gl: number; // glycemic load per serving (approx.)
  note: string;
  alt?: string;
};

export const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const FOODS: Food[] = [
  {
    id: 'avocado',
    name: 'Avocado',
    serving: '½ medium (100 g)',
    categories: ['Breakfast', 'Snacks'],
    verdict: 'good',
    tags: ['Healthy fats', 'High fiber'],
    nutrients: { kcal: 160, carbs: 9, fiber: 7, protein: 2, fat: 15, sugar: 0.7 },
    gi: 'Low',
    gl: 1,
    note: 'Healthy fats and fibre help slow digestion and keep blood sugar steady.',
  },
  {
    id: 'fruit-yogurt',
    name: 'Sweetened Fruit Yogurt',
    serving: '1 pot (150 g)',
    categories: ['Breakfast', 'Snacks'],
    verdict: 'limit',
    tags: ['High added sugar'],
    nutrients: { kcal: 140, carbs: 23, fiber: 0, protein: 5, fat: 3, sugar: 19 },
    gi: 'Medium',
    gl: 9,
    note: 'Added sugar can cause blood sugar spikes.',
    alt: 'greek-yogurt',
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    serving: '¾ cup (170 g), plain',
    categories: ['Breakfast', 'Snacks'],
    verdict: 'good',
    tags: ['High protein', 'Low sugar'],
    nutrients: { kcal: 100, carbs: 6, fiber: 0, protein: 17, fat: 0.7, sugar: 6 },
    gi: 'Low',
    gl: 1,
    note: 'Protein-rich and low in sugar. Add berries instead of buying it pre-sweetened.',
  },
  {
    id: 'white-bread',
    name: 'White Bread',
    serving: '2 slices (50 g)',
    categories: ['Breakfast', 'Lunch'],
    verdict: 'limit',
    tags: ['High GI', 'Low fiber'],
    nutrients: { kcal: 133, carbs: 25, fiber: 1.3, protein: 4.5, fat: 1.6, sugar: 2.5 },
    gi: 'High',
    gl: 18,
    note: 'Refined flour is digested quickly and raises blood sugar fast.',
    alt: 'oats',
  },
  {
    id: 'oats',
    name: 'Rolled Oats',
    serving: '½ cup dry (40 g)',
    categories: ['Breakfast'],
    verdict: 'good',
    tags: ['Whole grain', 'High fiber'],
    nutrients: { kcal: 150, carbs: 27, fiber: 4, protein: 5, fat: 3, sugar: 0.4 },
    gi: 'Low–medium',
    gl: 13,
    note: 'Soluble fibre (beta-glucan) supports steadier blood sugar.',
  },
  {
    id: 'lentils',
    name: 'Lentils',
    serving: '1 cup cooked (198 g)',
    categories: ['Lunch', 'Dinner'],
    verdict: 'good',
    tags: ['Plant protein', 'High fiber'],
    nutrients: { kcal: 230, carbs: 40, fiber: 15.6, protein: 18, fat: 0.8, sugar: 3.6 },
    gi: 'Low',
    gl: 8,
    note: 'A filling mix of protein and fibre with a gentle effect on blood sugar.',
  },
  {
    id: 'salmon',
    name: 'Grilled Salmon',
    serving: '1 fillet (100 g)',
    categories: ['Lunch', 'Dinner'],
    verdict: 'good',
    tags: ['Omega-3', 'High protein'],
    nutrients: { kcal: 206, carbs: 0, fiber: 0, protein: 22, fat: 12, sugar: 0 },
    gi: 'None',
    gl: 0,
    note: 'Omega-3 fats may help with inflammation linked to PCOS.',
  },
  {
    id: 'berries',
    name: 'Mixed Berries',
    serving: '1 cup (150 g)',
    categories: ['Snacks', 'Breakfast'],
    verdict: 'good',
    tags: ['Antioxidants', 'Low GI'],
    nutrients: { kcal: 70, carbs: 17, fiber: 4, protein: 1, fat: 0.5, sugar: 10 },
    gi: 'Low',
    gl: 5,
    note: 'Naturally sweet with fibre — a good swap for sweets.',
  },
];

export const findFood = (id: string) => FOODS.find((f) => f.id === id);
