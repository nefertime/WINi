import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = parseBody(verifyEmailSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { token } = parsed.data;

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Verification link is invalid or expired" },
      { status: 400 }
    );
  }

  // Mark user email as verified
  await prisma.user.updateMany({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ message: "Email verified" });
}
