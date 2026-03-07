import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAccountSchema, parseBody } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await checkRateLimit("deleteAccount", session.user.id);
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const parsed = parseBody(deleteAccountSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Credentials users must confirm with password
  if (user.passwordHash) {
    if (!password) {
      return NextResponse.json({ error: "Password required to delete account" }, { status: 400 });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }
  }

  // Prisma cascading deletes handle Account, AuthSession, SavedPairing, FavoriteWine
  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ deleted: true });
}
