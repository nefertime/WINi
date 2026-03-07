import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const rateLimited = await checkRateLimit("forgotPassword", getClientIp(request));
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const parsed = parseBody(resetPasswordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { token, password } = parsed.data;

  // Find valid, non-expired token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 }
    );
  }

  // Find user by email (identifier)
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  // Update password and delete token
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ message: "Password reset successfully" });
}
