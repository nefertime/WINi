import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Always return success to prevent email enumeration
  // TODO: Implement actual email sending when ready
  console.log(`[forgot-password] Reset requested for: ${email}`);

  return NextResponse.json({
    message: "If an account exists with this email, you will receive a password reset link.",
  });
}
