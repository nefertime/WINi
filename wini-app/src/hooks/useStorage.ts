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
    if (!isAuthenticated) return [];
    const res = await fetch("/api/user/pairings");
    if (!res.ok) return [];
    return res.json();
  };

  const saveSession = async (s: Session): Promise<void> => {
    if (!isAuthenticated) return;
    await fetch("/api/user/pairings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
  };

  const deleteSessionById = async (id: string): Promise<void> => {
    if (!isAuthenticated) return;
    await fetch("/api/user/pairings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const getFavorites = async (): Promise<FavoriteWine[]> => {
    if (!isAuthenticated) return [];
    const res = await fetch("/api/user/favorites");
    if (!res.ok) return [];
    return res.json();
  };

  const saveFavorite = async (wine: Wine, pairedWith?: string, pairedDishData?: Dish[]): Promise<void> => {
    if (!isAuthenticated) return;
    await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wine, pairedWith, pairedDishData }),
    });
  };

  const removeFavorite = async (wine: Wine): Promise<void> => {
    if (!isAuthenticated) return;
    await fetch("/api/user/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wine }),
    });
  };

  const isFavorite = (_wine: Wine): boolean => {
    // Guests can't have favorites — no localStorage writes
    if (!isAuthenticated) return false;
    // For authenticated users, favorites are loaded async into component state
    // This sync check is a fallback only
    return localStorage.isFavorite(_wine);
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
