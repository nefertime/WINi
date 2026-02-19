import { test, expect } from "@playwright/test";
import {
  mockAnalyzeAPI,
  mockWineInfoAPI,
  uploadMenu,
  waitForResults,
  submitSearch,
  cleanState,
} from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Responsive — Tablet (820×1180)", () => {
  test.use({ viewport: { width: 820, height: 1180 } });

  test("layout renders correctly at tablet width", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const firstDish = page.locator('[id^="dish-"]').first();
    const firstWine = page.locator('[id^="wine-"]').first();

    const dishBox = await firstDish.boundingBox();
    const wineBox = await firstWine.boundingBox();

    expect(dishBox).not.toBeNull();
    expect(wineBox).not.toBeNull();
    expect(dishBox!.width).toBeGreaterThan(150);
    expect(wineBox!.width).toBeGreaterThan(150);
  });

  test("bottle info popup stays within viewport", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await page.goto("/");

    const infoButton = page.getByLabel("Wine information").first();
    await infoButton.click({ force: true });
    await page.waitForTimeout(300);

    const vivinoLink = page.getByText("Find on Vivino").first();
    await expect(vivinoLink).toBeVisible();

    // Check the popup container stays within viewport bounds
    const popupBounds = await page.evaluate(() => {
      const link = document.querySelector('a[href*="vivino"]');
      if (!link) return null;
      // Walk up to the popup container (the positioned div)
      let el = link.parentElement;
      while (el && !el.style.position?.includes("absolute")) {
        el = el.parentElement;
      }
      if (!el) el = link.parentElement;
      const rect = (el as Element).getBoundingClientRect();
      return { right: rect.right };
    });

    if (popupBounds) {
      expect(popupBounds.right).toBeLessThanOrEqual(820);
    }
  });

  test("favorite popup positions correctly beside menu", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Favorite the first wine (Vermentino di Sardegna)
    const heartButton = page.locator('[aria-label="Add to favorites"]').first();
    await heartButton.click({ force: true });
    await page.waitForTimeout(300);

    // Open the hamburger menu
    await page.getByLabel("Open menu").click({ force: true });
    await page.waitForTimeout(300);

    // Click the saved wine row containing "Vermentino"
    const savedWineRow = page.locator(".group").filter({ hasText: "Vermentino" }).first();
    await savedWineRow.click({ force: true });
    await page.waitForTimeout(400);

    // The popup with "Paired with" should be visible
    const pairedWithText = page.getByText(/Paired with/i).first();
    await expect(pairedWithText).toBeVisible();

    // On tablet (820px >= 640px), popup renders to the right of the menu
    const popupBounds = await page.evaluate(() => {
      const els = document.querySelectorAll("*");
      for (const el of els) {
        if (el.textContent?.includes("Paired with") && el.textContent?.includes("More about")) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 50) {
            return { right: rect.right };
          }
        }
      }
      return null;
    });

    if (popupBounds) {
      expect(popupBounds.right).toBeLessThanOrEqual(820);
    }
  });

  test("FloatingHints visible at tablet width", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await page.goto("/");

    // FloatingHints appear on the home screen at >= 640px viewport width
    const hint = page.locator("text=/photo|upload/i").first();
    await expect(hint).toBeVisible();
  });

  test("WineDetailOverlay sizing appropriate", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Click the first wine card to open the detail overlay
    const firstWineCard = page.locator('[id^="wine-"]').first();
    await firstWineCard.click({ force: true });
    await page.waitForTimeout(300);

    // The overlay close button should be visible
    const closeButton = page.locator('[aria-label="Close wine details"]');
    await expect(closeButton).toBeVisible();

    // Get the overlay panel (parent of close button)
    const overlayBounds = await page.evaluate(() => {
      const closeBtn = document.querySelector('[aria-label="Close wine details"]');
      if (!closeBtn) return null;
      const parent = closeBtn.parentElement;
      if (!parent) return null;
      const rect = parent.getBoundingClientRect();
      return { width: rect.width, left: rect.left, right: rect.right };
    });

    expect(overlayBounds).not.toBeNull();
    // On tablet, the overlay should not be full-width (mobile) nor too wide (desktop overflow)
    expect(overlayBounds!.width).toBeGreaterThanOrEqual(280);
    expect(overlayBounds!.width).toBeLessThanOrEqual(500);
  });

  test("DishShelf pills wrap gracefully", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Dismiss the Arancini dish
    const dismissButton = page.getByLabel("Dismiss Arancini");
    await dismissButton.click({ force: true });
    await page.waitForTimeout(350);

    // The shelf should show the "Menu" label
    const menuLabel = page.locator("text=Menu").first();
    await expect(menuLabel).toBeVisible();

    // The dismissed dish pill (Arancini) should be visible in the shelf
    const aranciniPill = page.locator("button").filter({ hasText: "Arancini" }).first();
    await expect(aranciniPill).toBeVisible();

    // Verify the pill stays within the viewport bounds
    const pillBox = await aranciniPill.boundingBox();
    expect(pillBox).not.toBeNull();
    expect(pillBox!.x).toBeGreaterThanOrEqual(0);
    expect(pillBox!.x + pillBox!.width).toBeLessThanOrEqual(820);
  });
});
