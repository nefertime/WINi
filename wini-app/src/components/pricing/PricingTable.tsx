"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  priceId: string | null;
  highlighted: boolean;
};

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Discover wine pairings",
    features: [
      "3 pairings per day",
      "Basic wine recommendations",
      "Menu photo scanning",
    ],
    priceId: null,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "9.99",
    period: "month",
    description: "Unlimited sommelier access",
    features: [
      "Unlimited pairings",
      "Detailed tasting notes",
      "Save favorite wines",
      "Pairing history",
      "Priority AI responses",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? null,
    highlighted: true,
  },
];

export default function PricingTable() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16">
      <h2
        className="text-center font-cormorant text-cream-lightest mb-2"
        style={{ fontSize: "clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)" }}
      >
        Choose Your Experience
      </h2>
      <p className="text-center font-jost text-cream/60 mb-12 text-sm">
        Unlock the full power of your AI sommelier
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`
              relative rounded-2xl p-8 transition-all duration-300
              ${
                tier.highlighted
                  ? "bg-burgundy/30 border border-gold/40 shadow-[0_0_40px_rgba(201,168,76,0.1)]"
                  : "bg-white/5 border border-white/10"
              }
            `}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-charcoal font-jost text-xs font-semibold px-4 py-1 rounded-full">
                Recommended
              </span>
            )}

            <h3 className="font-cormorant text-cream-lightest text-2xl mb-1">
              {tier.name}
            </h3>
            <p className="font-jost text-cream/50 text-sm mb-6">
              {tier.description}
            </p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-cormorant text-cream-lightest text-5xl font-semibold">
                ${tier.price}
              </span>
              <span className="font-jost text-cream/40 text-sm">
                /{tier.period}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 font-jost text-cream/80 text-sm"
                >
                  <span className="text-gold mt-0.5 shrink-0">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>

            {tier.priceId ? (
              <button
                onClick={() => handleCheckout(tier.priceId!)}
                disabled={loading === tier.priceId || !session}
                className={`
                  w-full py-3 rounded-xl font-jost font-medium text-sm
                  transition-all duration-200
                  ${
                    tier.highlighted
                      ? "bg-gold text-charcoal hover:bg-gold/90 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/10 text-cream-lightest hover:bg-white/15"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
                style={{ transitionTimingFunction: "var(--ease-luxury)" }}
              >
                {loading === tier.priceId
                  ? "Redirecting..."
                  : !session
                    ? "Sign in to subscribe"
                    : "Get Pro"}
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl font-jost font-medium text-sm text-center bg-white/5 text-cream/40">
                Current plan
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
