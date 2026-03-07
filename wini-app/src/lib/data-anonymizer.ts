/**
 * Data anonymization utility for aggregate analytics.
 * Admin-only — strips PII and outputs aggregate pairing patterns.
 * Only processes users who have granted "anonymized_analytics" consent.
 */

import { prisma } from "@/lib/prisma";

type AnonPairingPattern = {
  dishCategory: string;
  wineType: string;
  count: number;
  avgScore: number;
};

type AnonRegionPreference = {
  region: string;
  wineType: string;
  count: number;
};

export type AnonymizedData = {
  generatedAt: string;
  totalConsentedUsers: number;
  pairingPatterns: AnonPairingPattern[];
  regionPreferences: AnonRegionPreference[];
};

export async function generateAnonymizedData(): Promise<AnonymizedData> {
  // Only include users who granted consent
  const consentedUsers = await prisma.dataConsent.findMany({
    where: { type: "anonymized_analytics", granted: true },
    select: { userId: true },
  });

  const consentedIds = consentedUsers.map((c: { userId: string }) => c.userId);
  if (consentedIds.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      totalConsentedUsers: 0,
      pairingPatterns: [],
      regionPreferences: [],
    };
  }

  const pairings = await prisma.savedPairing.findMany({
    where: { userId: { in: consentedIds } },
    select: { sessionData: true },
  });

  const patternMap = new Map<string, { count: number; totalScore: number }>();
  const regionMap = new Map<string, number>();

  for (const p of pairings) {
    try {
      const session = JSON.parse(p.sessionData);
      const dishes: { id: string; category: string }[] = session.dishes ?? [];
      const wines: { id: string; type: string; region: string }[] = session.wines ?? [];
      const pairs: { dish_id: string; wine_id: string; score: number }[] = session.pairings ?? [];

      const dishMap = new Map(dishes.map((d) => [d.id, d]));
      const wineMap = new Map(wines.map((w) => [w.id, w]));

      for (const pair of pairs) {
        const dish = dishMap.get(pair.dish_id);
        const wine = wineMap.get(pair.wine_id);
        if (!dish || !wine) continue;

        const key = `${dish.category}:${wine.type}`;
        const existing = patternMap.get(key) ?? { count: 0, totalScore: 0 };
        patternMap.set(key, { count: existing.count + 1, totalScore: existing.totalScore + pair.score });

        const regionKey = `${wine.region}:${wine.type}`;
        regionMap.set(regionKey, (regionMap.get(regionKey) ?? 0) + 1);
      }
    } catch {
      // Skip malformed session data
    }
  }

  const pairingPatterns: AnonPairingPattern[] = Array.from(patternMap.entries())
    .map(([key, val]) => {
      const [dishCategory, wineType] = key.split(":");
      return { dishCategory, wineType, count: val.count, avgScore: val.totalScore / val.count };
    })
    .sort((a, b) => b.count - a.count);

  const regionPreferences: AnonRegionPreference[] = Array.from(regionMap.entries())
    .map(([key, count]) => {
      const [region, wineType] = key.split(":");
      return { region, wineType, count };
    })
    .sort((a, b) => b.count - a.count);

  return {
    generatedAt: new Date().toISOString(),
    totalConsentedUsers: consentedIds.length,
    pairingPatterns,
    regionPreferences,
  };
}
