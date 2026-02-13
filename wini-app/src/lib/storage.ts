import { Dish, Session, FavoriteWine, Wine } from "./types";

const STORAGE_KEY = "wini_sessions";
const FAVORITES_KEY = "wini_favorites";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: Session[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired sessions
    return sessions.filter((s) => now - s.timestamp < TTL_MS);
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const existing = sessions.findIndex((s) => s.id === session.id);
  if (existing >= 0) {
    sessions[existing] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSession(id: string): Session | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Favorites ---

export function getFavorites(): FavoriteWine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFavorite(wine: Wine, pairedWith?: string, pairedDishData?: Dish[]): void {
  if (typeof window === "undefined") return;
  const favorites = getFavorites();
  // Dedupe by wine name + type + region (same wine shouldn't appear twice)
  const exists = favorites.some(
    (f) => f.wine.name === wine.name && f.wine.type === wine.type && f.wine.region === wine.region
  );
  if (exists) return;
  favorites.unshift({
    id: generateId(),
    wine,
    savedAt: Date.now(),
    pairedWith,
    pairedDishData,
  });
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(wine: Wine): void {
  if (typeof window === "undefined") return;
  const favorites = getFavorites().filter(
    (f) => !(f.wine.name === wine.name && f.wine.type === wine.type && f.wine.region === wine.region)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(wine: Wine): boolean {
  return getFavorites().some(
    (f) => f.wine.name === wine.name && f.wine.type === wine.type && f.wine.region === wine.region
  );
}
