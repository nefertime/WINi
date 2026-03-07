import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consentSchema, parseBody } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consents = await prisma.dataConsent.findMany({
    where: { userId: session.user.id },
    select: { type: true, granted: true, version: true, updatedAt: true },
  });

  return NextResponse.json(consents);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseBody(consentSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { type, granted } = parsed.data;

  const consent = await prisma.dataConsent.upsert({
    where: { userId_type: { userId: session.user.id, type } },
    update: { granted, updatedAt: new Date() },
    create: { userId: session.user.id, type, granted },
  });

  return NextResponse.json({
    type: consent.type,
    granted: consent.granted,
    updatedAt: consent.updatedAt,
  });
}
