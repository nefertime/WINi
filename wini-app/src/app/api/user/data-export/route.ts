import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await checkRateLimit("dataExport", session.user.id);
  if (rateLimited) return rateLimited;

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      age: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const pairings = await prisma.savedPairing.findMany({
    where: { userId },
    select: { sessionData: true, preview: true, savedAt: true },
    orderBy: { savedAt: "desc" },
  });

  const favorites = await prisma.favoriteWine.findMany({
    where: { userId },
    select: { wineData: true, pairedWith: true, pairedDishData: true, savedAt: true },
    orderBy: { savedAt: "desc" },
  });

  const consents = await prisma.dataConsent.findMany({
    where: { userId },
    select: { type: true, granted: true, version: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile: user,
    savedPairings: pairings.map((p) => ({
      preview: p.preview,
      savedAt: p.savedAt,
      data: JSON.parse(p.sessionData),
    })),
    favoriteWines: favorites.map((f) => ({
      wine: JSON.parse(f.wineData),
      pairedWith: f.pairedWith,
      pairedDishData: f.pairedDishData ? JSON.parse(f.pairedDishData) : null,
      savedAt: f.savedAt,
    })),
    consents,
  });
}
