export type CookieConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

const COOKIE_NAME = "wini_cookie_consent";
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export function getConsentPreferences(): CookieConsentPreferences | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

export function setConsentPreferences(prefs: CookieConsentPreferences): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function hasConsentCookie(): boolean {
  return getConsentPreferences() !== null;
}
