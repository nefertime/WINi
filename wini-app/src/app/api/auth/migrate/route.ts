import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Session, FavoriteWine } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessions, favorites } = (await request.json()) as {
    sessions: Session[];
    favorites: FavoriteWine[];
  };

  const userId = session.user.id;

  // Migrate sessions (idempotent — check preview + timestamp)
  for (const s of sessions) {
    const exists = await prisma.savedPairing.findFirst({
      where: {
        userId,
        preview: s.preview,
        savedAt: new Date(s.timestamp),
      },
    });

    if (!exists) {
      await prisma.savedPairing.create({
        data: {
          userId,
          sessionData: JSON.stringify(s),
          preview: s.preview,
          savedAt: new Date(s.timestamp),
        },
      });
    }
  }

  // Migrate favorites (idempotent — check wine name)
  for (const f of favorites) {
    const wineData = JSON.stringify(f.wine);
    const exists = await prisma.favoriteWine.findFirst({
      where: { userId, wineData },
    });

    if (!exists) {
      await prisma.favoriteWine.create({
        data: {
          userId,
          wineData,
          pairedWith: f.pairedWith,
          pairedDishData: f.pairedDishData ? JSON.stringify(f.pairedDishData) : null,
          savedAt: new Date(f.savedAt),
        },
      });
    }
  }

  return NextResponse.json({
    migrated: { sessions: sessions.length, favorites: favorites.length },
  });
}
