"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { Session, FavoriteWine, Wine, Dish } from "@/lib/types";
import * as localStorage from "@/lib/storage";
import { migrateLocalDataToServer } from "@/lib/data-migration";

export function useStorage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const hasMigrated = useRef(false);

  // Auto-migrate localStorage data to server on first login
  useEffect(() => {
    if (isAuthenticated && !hasMigrated.current) {
      hasMigrated.current = true;
      migrateLocalDataToServer();
    }
  }, [isAuthenticated]);

  const getSessions = async (): Promise<Session[]> => {
    if (!isAuthenticated) return localStorage.getSessions();
    const res = await fetch("/api/user/pairings");
    if (!res.ok) return localStorage.getSessions();
    return res.json();
  };

  const saveSession = async (s: Session): Promise<void> => {
    if (!isAuthenticated) {
      localStorage.saveSession(s);
      return;
    }
    await fetch("/api/user/pairings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
  };

  const deleteSessionById = async (id: string): Promise<void> => {
    if (!isAuthenticated) {
      localStorage.deleteSession(id);
      return;
    }
    await fetch("/api/user/pairings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const getFavorites = async (): Promise<FavoriteWine[]> => {
    if (!isAuthenticated) return localStorage.getFavorites();
    const res = await fetch("/api/user/favorites");
    if (!res.ok) return localStorage.getFavorites();
    return res.json();
  };

  const saveFavorite = async (wine: Wine, pairedWith?: string, pairedDishData?: Dish[]): Promise<void> => {
    if (!isAuthenticated) {
      localStorage.saveFavorite(wine, pairedWith, pairedDishData);
      return;
    }
    await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wine, pairedWith, pairedDishData }),
    });
  };

  const removeFavorite = async (wine: Wine): Promise<void> => {
    if (!isAuthenticated) {
      localStorage.removeFavorite(wine);
      return;
    }
    await fetch("/api/user/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wine }),
    });
  };

  const isFavorite = (wine: Wine): boolean => {
    // Sync check for UI — only localStorage for now
    // Server favorites are loaded async and cached in component state
    return localStorage.isFavorite(wine);
  };

  return {
    isAuthenticated,
    session,
    getSessions,
    saveSession,
    deleteSession: deleteSessionById,
    getFavorites,
    saveFavorite,
    removeFavorite,
    isFavorite,
    generateId: localStorage.generateId,
  };
}
