import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Facebook Data Deletion Callback
 * Facebook POSTs here when a user removes the app from their Facebook settings.
 * We return a confirmation code and a status URL per Facebook's requirements.
 * See: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const signedRequest = body.get("signed_request") as string | null;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const data = parseSignedRequest(signedRequest, process.env.AUTH_FACEBOOK_SECRET!);
    if (!data) {
      return NextResponse.json({ error: "Invalid signed_request" }, { status: 403 });
    }

    // data.user_id contains the Facebook user ID requesting deletion
    const confirmationCode = crypto.randomUUID();

    // TODO: Queue actual deletion of user data associated with data.user_id
    // For now we log and return the confirmation — the /data-deletion page serves as the status URL
    console.log(`Facebook data deletion request: user_id=${data.user_id}, code=${confirmationCode}`);

    const statusUrl = `${process.env.NEXTAUTH_URL || "https://wini.alfredleppanen.com"}/data-deletion?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function parseSignedRequest(signedRequest: string, secret: string): { user_id: string } | null {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) return null;

  const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"));
  return decoded;
}
