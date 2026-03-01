import { Page, expect } from "@playwright/test";
import type { AnalyzeResponse, FavoriteWine, Session } from "../src/lib/types";
import path from "path";

const TEST_MENU_DIR = path.resolve(__dirname, "../../test-data/menus");

// Clean app state — clear localStorage keys + set cookie consent to suppress banner
export async function cleanState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("wini_sessions");
    localStorage.removeItem("wini_favorites");
  });
  // Set cookie consent so the banner doesn't appear and block interactions
  await page.context().addCookies([{
    name: "wini_cookie_consent",
    value: encodeURIComponent(JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() })),
    domain: "localhost",
    path: "/",
  }]);
}

// Dismiss cookie consent banner by setting the consent cookie
export async function dismissCookieConsent(page: Page) {
  await page.context().addCookies([{
    name: "wini_cookie_consent",
    value: encodeURIComponent(JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() })),
    domain: "localhost",
    path: "/",
  }]);
}

// Mock the /api/analyze endpoint with deterministic data
export async function mockAnalyzeAPI(page: Page, response: AnalyzeResponse) {
  await page.route("**/api/analyze", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

// Mock the /api/translate endpoint (pass-through with language set to "en")
export async function mockTranslateAPI(page: Page) {
  await page.route("**/api/translate", async (route) => {
    const body = JSON.parse((await route.request().postData()) || "{}");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...body.data, language: "en" }),
    });
  });
}

// Mock the /api/wine-info endpoint
export async function mockWineInfoAPI(page: Page) {
  await page.route("**/api/wine-info", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        name: "Test Wine",
        type: "red",
        region: "Test Region",
        appellation: "Test AOC",
        grape: "Test Grape",
        vintage: "2020",
        tasting_notes: "Rich and complex.",
        origin_story: "A storied vineyard.",
        food_pairings: ["Steak", "Cheese"],
      }),
    });
  });
}

// Upload a test menu image via the file picker
export async function uploadMenu(page: Page, filename = "wino_food_menu.png") {
  const filePath = path.join(TEST_MENU_DIR, filename);

  // Click the camera button to trigger the file picker
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
}

// Wait for results to appear (dishes column visible)
export async function waitForResults(page: Page) {
  // Wait for the results layout to show dishes
  await page.locator("text=Dishes").first().waitFor({ state: "visible", timeout: 10000 });
}

// Get all visible wine card names
export async function getVisibleWineNames(page: Page): Promise<string[]> {
  const wineCards = page.locator("[id^='wine-']");
  const count = await wineCards.count();
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = await wineCards.nth(i).locator("span").first().textContent();
    if (name) names.push(name.trim());
  }
  return names;
}

// Get all visible dish names
export async function getVisibleDishNames(page: Page): Promise<string[]> {
  const dishCards = page.locator("[id^='dish-']");
  const count = await dishCards.count();
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    // Dish name is inside a span with font-cormorant
    const spans = dishCards.nth(i).locator("span");
    // Second span is the name (first is emoji)
    const name = await spans.nth(1).textContent();
    if (name) names.push(name.trim());
  }
  return names;
}

// Submit the search (click send button)
export async function submitSearch(page: Page) {
  await page.locator('[aria-label="Search"]').click();
}

// Save the current pairing via the Save button
export async function savePairing(page: Page) {
  await page.locator('[aria-label="Save this pairing"]').click();
  await expect(page.locator('[aria-label="Remove saved pairing"]')).toBeVisible();
}

// Mock Auth.js session + storage API routes so useStorage treats tests as authenticated.
// Must be called BEFORE page.goto("/") so SessionProvider fetches the mocked session on mount.
export async function setupAuthenticatedUser(page: Page) {
  const favorites: FavoriteWine[] = [];
  const sessions: Session[] = [];

  // Auth.js session — makes useSession() return status: "authenticated"
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "test-user-1", name: "Test User", email: "test@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
  });

  // Favorites CRUD — in-memory array scoped to this test
  await page.route("**/api/user/favorites", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(favorites),
      });
    } else if (method === "POST") {
      const body = JSON.parse((await route.request().postData()) || "{}");
      const key = JSON.stringify(body.wine);
      // Dedup by wine JSON (matches real Prisma route logic)
      if (!favorites.some((f) => JSON.stringify(f.wine) === key)) {
        favorites.push({
          id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          wine: body.wine,
          savedAt: Date.now(),
          pairedWith: body.pairedWith,
          pairedDishData: body.pairedDishData,
        });
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else if (method === "DELETE") {
      const body = JSON.parse((await route.request().postData()) || "{}");
      const key = JSON.stringify(body.wine);
      const idx = favorites.findIndex((f) => JSON.stringify(f.wine) === key);
      if (idx !== -1) favorites.splice(idx, 1);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else {
      await route.continue();
    }
  });

  // Pairings (sessions) CRUD — in-memory array scoped to this test
  await page.route("**/api/user/pairings", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(sessions),
      });
    } else if (method === "POST") {
      const body: Session = JSON.parse((await route.request().postData()) || "{}");
      const idx = sessions.findIndex((s) => s.id === body.id);
      if (idx !== -1) sessions[idx] = body;
      else sessions.push(body);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else if (method === "DELETE") {
      const body = JSON.parse((await route.request().postData()) || "{}");
      const idx = sessions.findIndex((s) => s.id === body.id);
      if (idx !== -1) sessions.splice(idx, 1);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else {
      await route.continue();
    }
  });
}
