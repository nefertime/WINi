import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoriteWine, Wine, Dish } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favs = await prisma.favoriteWine.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
  });

  const favorites: FavoriteWine[] = favs.map((f) => ({
    id: f.id,
    wine: JSON.parse(f.wineData) as Wine,
    savedAt: f.savedAt.getTime(),
    pairedWith: f.pairedWith ?? undefined,
    pairedDishData: f.pairedDishData
      ? (JSON.parse(f.pairedDishData) as Dish[])
      : undefined,
  }));

  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wine, pairedWith, pairedDishData } = (await request.json()) as {
    wine: Wine;
    pairedWith?: string;
    pairedDishData?: Dish[];
  };

  const wineData = JSON.stringify(wine);

  // Dedupe by wine data
  const existing = await prisma.favoriteWine.findFirst({
    where: { userId: session.user.id, wineData },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const fav = await prisma.favoriteWine.create({
    data: {
      userId: session.user.id,
      wineData,
      pairedWith,
      pairedDishData: pairedDishData ? JSON.stringify(pairedDishData) : null,
    },
  });

  return NextResponse.json({ id: fav.id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wine } = (await request.json()) as { wine: Wine };
  const wineData = JSON.stringify(wine);

  await prisma.favoriteWine.deleteMany({
    where: { userId: session.user.id, wineData },
  });

  return NextResponse.json({ deleted: true });
}
