import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "WINi <noreply@alfredleppanen.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3100";

export async function sendVerificationEmail(email: string, token: string) {
  if (!resend) {
    console.log(`[email] Verification email to ${email} (Resend not configured). Token: ${token}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your WINi account",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0D0D0D; color: #FAF6F0;">
        <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 24px;">Welcome to WINi</h1>
        <p style="color: #E8DCC8; line-height: 1.6;">Click the link below to verify your email address:</p>
        <a href="${BASE_URL}/verify-email?token=${token}"
           style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #C9A84C; color: #0D0D0D; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
        <p style="color: rgba(232, 220, 200, 0.5); font-size: 13px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.log(`[email] Password reset to ${email} (Resend not configured). Token: ${token}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your WINi password",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0D0D0D; color: #FAF6F0;">
        <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 24px;">Password Reset</h1>
        <p style="color: #E8DCC8; line-height: 1.6;">Click the link below to reset your password:</p>
        <a href="${BASE_URL}/reset-password?token=${token}"
           style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #C9A84C; color: #0D0D0D; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: rgba(232, 220, 200, 0.5); font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
