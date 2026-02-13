import { Session, FavoriteWine } from "./types";

const STORAGE_KEY = "wini_sessions";
const FAVORITES_KEY = "wini_favorites";

export async function migrateLocalDataToServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const rawSessions = localStorage.getItem(STORAGE_KEY);
  const rawFavorites = localStorage.getItem(FAVORITES_KEY);

  const sessions: Session[] = rawSessions ? JSON.parse(rawSessions) : [];
  const favorites: FavoriteWine[] = rawFavorites ? JSON.parse(rawFavorites) : [];

  if (sessions.length === 0 && favorites.length === 0) return false;

  try {
    const res = await fetch("/api/auth/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions, favorites }),
    });

    if (res.ok) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FAVORITES_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
