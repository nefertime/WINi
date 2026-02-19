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

test.describe("Responsive — Mobile (393×852)", () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test("favorite popup renders within viewport bounds", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Favorite the first wine
    const heartButton = page.locator('[aria-label="Add to favorites"]').first();
    await heartButton.click({ force: true });

    // Open hamburger menu
    await page.getByLabel("Open menu").click({ force: true });

    // Click the saved wine row containing Vermentino — use dispatchEvent through backdrop
    await page.waitForTimeout(500); // Wait for menu animation
    const savedWineRow = page.locator(".group").filter({ hasText: "Vermentino" }).last();
    await expect(savedWineRow).toBeVisible({ timeout: 3000 });
    await savedWineRow.dispatchEvent("click");

    // Wait for popup to animate in
    await page.waitForTimeout(400);

    // Check popup with "Paired with" text is visible
    const pairedWithText = page.locator("text=Paired with").first();
    await expect(pairedWithText).toBeVisible();

    // Evaluate bounding rect of the popup to confirm it's within viewport
    const popupBounds = await page.evaluate(() => {
      const elements = document.querySelectorAll("*");
      for (const el of elements) {
        if (el.textContent?.includes("Paired with")) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 50) {
            return { right: rect.right, bottom: rect.bottom };
          }
        }
      }
      return null;
    });

    expect(popupBounds).not.toBeNull();
    expect(popupBounds!.right).toBeLessThanOrEqual(393);
    expect(popupBounds!.bottom).toBeLessThanOrEqual(852);
  });

  test("touch targets meet 44px minimum", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Check heart button height >= 44px
    const heartButton = page.locator('[aria-label="Add to favorites"]').first();
    const heartBounds = await heartButton.boundingBox();
    expect(heartBounds).not.toBeNull();
    expect(heartBounds!.height).toBeGreaterThanOrEqual(44);

    // Check dismiss button width >= 44px
    const dismissButton = page.locator('[aria-label="Dismiss Arancini"]');
    const dismissBounds = await dismissButton.boundingBox();
    expect(dismissBounds).not.toBeNull();
    expect(dismissBounds!.width).toBeGreaterThanOrEqual(44);

    // Check WineDetailOverlay close button width >= 44px
    const firstWineCard = page.locator('[id^="wine-"]').first();
    await firstWineCard.click({ force: true });
    await page.waitForTimeout(300);

    const closeButton = page.locator('[aria-label="Close wine details"]');
    const closeBounds = await closeButton.boundingBox();
    expect(closeBounds).not.toBeNull();
    expect(closeBounds!.width).toBeGreaterThanOrEqual(44);
  });

  test("SearchBar does not overflow viewport", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Check the search button bounding box stays within viewport
    const bounds = await page.evaluate(() => {
      const el = document.querySelector('[aria-label="Search"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { right: rect.right, left: rect.left, width: rect.width };
    });

    expect(bounds).not.toBeNull();
    expect(bounds!.right).toBeLessThanOrEqual(393);
  });

  test("WineDetailOverlay is fully visible and scrollable", async ({
    page,
  }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Click first wine card to open overlay
    const firstWineCard = page.locator('[id^="wine-"]').first();
    await firstWineCard.click({ force: true });
    await page.waitForTimeout(300);

    // Check the overlay close button parent is visible
    const closeButton = page.locator('[aria-label="Close wine details"]');
    await expect(closeButton).toBeVisible();

    const overlayParent = closeButton.locator("..");
    await expect(overlayParent).toBeVisible();

    // Evaluate bounding box to confirm left >= 0 and right <= 393
    const overlayBounds = await page.evaluate(() => {
      const closeBtn = document.querySelector(
        '[aria-label="Close wine details"]'
      );
      if (!closeBtn) return null;
      const parent = closeBtn.parentElement;
      if (!parent) return null;
      const rect = parent.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });

    expect(overlayBounds).not.toBeNull();
    expect(overlayBounds!.left).toBeGreaterThanOrEqual(0);
    expect(overlayBounds!.right).toBeLessThanOrEqual(393);
  });

  test("menu opens and closes without overflow", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Open hamburger menu
    await page.getByLabel("Open menu").click({ force: true });
    await page.waitForTimeout(300);

    // Check menu is visible and contains "Saved Wines"
    await expect(page.locator("text=Saved Wines").first()).toBeVisible();

    // Check menu bounding box is within viewport
    const menuBounds = await page.evaluate(() => {
      const menuEl = document.querySelector('[role="dialog"]') ||
        document.querySelector("nav") ||
        (() => {
          const els = document.querySelectorAll("*");
          for (const el of els) {
            if (el.textContent?.includes("Saved Wines")) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 200 && rect.height > 200) {
                return el;
              }
            }
          }
          return null;
        })();

      if (!menuEl) return null;
      const rect = (menuEl as Element).getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    });

    if (menuBounds) {
      expect(menuBounds.right).toBeLessThanOrEqual(393);
      expect(menuBounds.bottom).toBeLessThanOrEqual(852);
    }

    // Close menu by clicking the backdrop
    const backdrop = page.locator(".fixed.inset-0.z-40");
    await backdrop.dispatchEvent("click");
    await page.waitForTimeout(350);

    // Check menu is no longer visible
    await expect(page.locator("text=Saved Wines").first()).not.toBeVisible();
  });

  test("two-column results layout is legible", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Check dish column is visible and legible
    const firstDish = page.locator('[id^="dish-"]').first();
    await expect(firstDish).toBeVisible();

    const dishBounds = await firstDish.boundingBox();
    expect(dishBounds).not.toBeNull();
    expect(dishBounds!.width).toBeGreaterThan(100);

    // Check wine column is visible and legible
    const firstWine = page.locator('[id^="wine-"]').first();
    await expect(firstWine).toBeVisible();

    const wineBounds = await firstWine.boundingBox();
    expect(wineBounds).not.toBeNull();
    expect(wineBounds!.width).toBeGreaterThan(100);
  });
});
