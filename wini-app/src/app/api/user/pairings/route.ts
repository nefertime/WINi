import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savePairingSchema, deletePairingSchema, parseBody } from "@/lib/validation";
import type { Session } from "@/lib/types";

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

  const body = await request.json();
  const parsed = parseBody(savePairingSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const data = parsed.data;

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

  const body = await request.json();
  const parsed = parseBody(deletePairingSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await prisma.savedPairing.deleteMany({
    where: { id: parsed.data.id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
