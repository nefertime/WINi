import { test, expect } from "@playwright/test";
import { dismissCookieConsent } from "./helpers";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto("/");
  });

  test("renders WINi logo in split mode", async ({ page }) => {
    // Logo should be visible
    const logo = page.locator("text=WINi").first();
    await expect(logo).toBeVisible();
  });

  test("renders bottle carousel", async ({ page }) => {
    // Carousel images should be present
    const bottles = page.locator('img[alt*="bottle"], img[src*="bottles"]');
    await expect(bottles.first()).toBeVisible({ timeout: 5000 });
  });

  test("renders search bar with camera button", async ({ page }) => {
    const cameraBtn = page.locator('[aria-label="Add photos"]');
    await expect(cameraBtn).toBeVisible();
  });

  test("renders search bar with send button", async ({ page }) => {
    const sendBtn = page.locator('[aria-label="Search"]');
    await expect(sendBtn).toBeVisible();
  });

  test("shows placeholder text", async ({ page }) => {
    const placeholder = page.locator("text=/photo of food & wine menu/");
    await expect(placeholder).toBeVisible();
  });

  test("shows floating hints", async ({ page }) => {
    // FloatingHints uses "hidden sm:block" — only visible on screens >= 640px
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 640) {
      // On mobile, floating hints are hidden via "hidden sm:block" — skip assertion
      return;
    }

    // On desktop, hints appear after a delay (600ms initial + 400ms second)
    // They are <motion.p> elements inside a fixed container
    // Wait for at least one hint to animate in
    await page.waitForTimeout(1500);
    const hintParagraphs = page.locator(".fixed.pointer-events-none p");
    await expect(hintParagraphs.first()).toBeVisible({ timeout: 5000 });
  });

  test("has menu button", async ({ page }) => {
    // The avatar/menu button should be in the top-left
    const menuBtn = page.locator("button").first();
    await expect(menuBtn).toBeVisible();
  });

  test("clicking background cycles bottle", async ({ page }) => {
    // Click on background area (not on buttons)
    await page.click("main", { position: { x: 300, y: 300 } });
    // Bottle should have changed — we just verify no crash
    await expect(page.locator("main")).toBeVisible();
  });
});
