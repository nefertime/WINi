import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { checkoutSchema, parseBody } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseBody(checkoutSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { priceId } = parsed.data;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3100";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    metadata: { userId: session.user.id },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
