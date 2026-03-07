import { NextResponse } from "next/server";

/**
 * In-memory sliding window rate limiter.
 * No external dependencies — works perfectly for a single Container App instance.
 * State resets on container restart, which is acceptable for rate limiting.
 */

type WindowEntry = { count: number; resetAt: number };

const store = new Map<string, WindowEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

type LimiterConfig = { requests: number; windowMs: number };

// Rate limiters per endpoint category
const configs: Record<string, LimiterConfig> = {
  register: { requests: 5, windowMs: 15 * 60 * 1000 },
  forgotPassword: { requests: 3, windowMs: 15 * 60 * 1000 },
  login: { requests: 10, windowMs: 15 * 60 * 1000 },
  analyze: { requests: 20, windowMs: 60 * 60 * 1000 },
  aiGeneral: { requests: 30, windowMs: 60 * 60 * 1000 },
  dataExport: { requests: 1, windowMs: 24 * 60 * 60 * 1000 },
  deleteAccount: { requests: 3, windowMs: 60 * 60 * 1000 },
};

export type RateLimiterKey = keyof typeof configs;

/**
 * Check rate limit. Returns null if allowed, or a 429 Response if exceeded.
 * identifier should be IP for unauthenticated routes, userId for authenticated.
 */
export async function checkRateLimit(
  key: RateLimiterKey,
  identifier: string
): Promise<NextResponse | null> {
  cleanup();

  const config = configs[key];
  if (!config) return null;

  const storeKey = `${key}:${identifier}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(storeKey, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  if (entry.count < config.requests) {
    entry.count++;
    return null;
  }

  // Rate limited
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

/** Extract IP from request (works behind proxies) */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
