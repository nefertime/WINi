import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pairings = await prisma.savedPairing.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
  });

  const sessions: Session[] = pairings.map((p) => ({
    ...JSON.parse(p.sessionData),
    id: p.id,
  }));

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: Session = await request.json();

  const pairing = await prisma.savedPairing.create({
    data: {
      userId: session.user.id,
      sessionData: JSON.stringify(data),
      preview: data.preview,
      savedAt: new Date(data.timestamp),
    },
  });

  return NextResponse.json({ id: pairing.id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.savedPairing.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
