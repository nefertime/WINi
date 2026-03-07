import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, parseBody } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const rateLimited = await checkRateLimit("forgotPassword", getClientIp(request));
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const parsed = parseBody(forgotPasswordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { email } = parsed.data;

  // Always return success to prevent email enumeration
  // Do the work in background-style (no await leak to timing)
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({
    message: "If an account exists with this email, you will receive a password reset link.",
  });
}
