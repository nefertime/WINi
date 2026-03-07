import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, parseBody } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const rateLimited = await checkRateLimit("register", getClientIp(request));
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Equalize timing to prevent user enumeration
      await bcrypt.hash("timing-pad", 12);
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, ...(name ? { name } : {}) },
    });

    // Send verification email (non-blocking)
    const verifyToken = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verifyToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    sendVerificationEmail(email, verifyToken).catch(console.error);

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
