import { z } from "zod";

// --- Auth schemas ---

export const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().max(100).optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  age: z.union([z.number().int().min(18).max(120), z.null()]).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
});

export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmation: z.literal(true),
});

// --- Migrate schemas ---

const dishSchema = z.object({
  id: z.string().max(50),
  name: z.string().max(200),
  description: z.string().max(1000),
  category: z.enum(["meat", "fish", "vegetarian", "pasta", "dessert", "appetizer", "salad", "soup", "other"]),
});

const wineSchema = z.object({
  id: z.string().max(50),
  name: z.string().max(200),
  type: z.enum(["red", "white", "rosé", "sparkling"]),
  grape: z.string().max(200),
  region: z.string().max(200),
  vintage: z.string().max(20),
});

const pairingSchema = z.object({
  dish_id: z.string().max(50),
  wine_id: z.string().max(50),
  score: z.number().min(0).max(1),
  reason: z.string().max(1000),
  detailed_reason: z.string().max(2000),
});

const sessionSchema = z.object({
  id: z.string().max(50),
  timestamp: z.number(),
  dishes: z.array(dishSchema).max(20),
  wines: z.array(wineSchema).max(30),
  pairings: z.array(pairingSchema).max(100),
  selections: z.array(z.object({ dish_id: z.string(), wine_id: z.string() })).max(100),
  preview: z.string().max(200),
  language: z.string().max(10).optional(),
  otherDishes: z.array(dishSchema).max(50).optional(),
});

const favoriteWineSchema = z.object({
  id: z.string().max(50),
  wine: wineSchema,
  savedAt: z.number(),
  pairedWith: z.string().max(500).optional(),
  pairedDishData: z.array(dishSchema).max(20).optional(),
});

export const migrateSchema = z.object({
  sessions: z.array(sessionSchema).max(100),
  favorites: z.array(favoriteWineSchema).max(200),
});

// --- User data schemas ---

export const saveFavoriteSchema = z.object({
  wine: wineSchema,
  pairedWith: z.string().max(500).optional(),
  pairedDishData: z.array(dishSchema).max(20).optional(),
});

export const deleteFavoriteSchema = z.object({
  wine: wineSchema,
});

export const savePairingSchema = sessionSchema;

export const deletePairingSchema = z.object({
  id: z.string().max(50),
});

// --- AI endpoint schemas ---

export const analyzeSchema = z.object({
  images: z.array(z.string().max(10_000_000)).max(10), // base64 images, max 10MB each
  text: z.string().max(500).optional(),
  dishNames: z.array(z.string().max(200)).max(20).optional(),
});

export const translateSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  sourceLanguage: z.string().max(20),
});

export const wineInfoSchema = z.object({
  wineName: z.string().max(200),
  wineType: z.string().max(50).optional(),
  grape: z.string().max(200).optional(),
  region: z.string().max(200).optional(),
});

export const checkoutSchema = z.object({
  priceId: z.string().regex(/^price_/, "Invalid price ID format").max(100),
});

// --- Consent schemas ---

export const consentSchema = z.object({
  type: z.enum(["anonymized_analytics", "preference_profiles"]),
  granted: z.boolean(),
});

// --- Helper ---

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return { success: false, error: message };
}
