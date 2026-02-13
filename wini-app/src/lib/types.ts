export type WineType = "red" | "white" | "rosé" | "sparkling";

export type DishCategory = "meat" | "fish" | "vegetarian" | "pasta" | "dessert" | "appetizer" | "salad" | "soup" | "other";

export type Dish = {
  id: string;
  name: string;
  description: string;
  category: DishCategory;
};

export type Wine = {
  id: string;
  name: string;
  type: WineType;
  grape: string;
  region: string;
  vintage: string;
};

export type Pairing = {
  dish_id: string;
  wine_id: string;
  score: number;
  reason: string;
  detailed_reason: string;
};

export type AnalyzeResponse = {
  dishes: Dish[];
  wines: Wine[];
  pairings: Pairing[];
  language?: string;
  otherDishes?: Dish[];
};

export type WineInfo = {
  name: string;
  type: WineType;
  region: string;
  appellation: string;
  grape: string;
  vintage: string;
  tasting_notes: string;
  origin_story: string;
  food_pairings: string[];
};

export type Session = {
  id: string;
  timestamp: number;
  dishes: Dish[];
  wines: Wine[];
  pairings: Pairing[];
  selections: { dish_id: string; wine_id: string }[];
  preview: string; // first dish name for display
  language?: string;
  otherDishes?: Dish[];
};

export type FavoriteWine = {
  id: string;
  wine: Wine;
  savedAt: number;
  pairedWith?: string; // dish name for context
  pairedDishData?: Dish[]; // full dish objects for overlay
};

export type BottleType = "red" | "white" | "both" | "sparkling" | "rosé";

export type Bottle = {
  name: string;
  src: string;
  type: BottleType;
};
