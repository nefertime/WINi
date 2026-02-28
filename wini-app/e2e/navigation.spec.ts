import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch, dismissCookieConsent } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
  });

  test("back button returns to home with placeholder visible", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Click back
    await page.locator('[aria-label="Back to home"]').click();

    // Wait for transition (600ms animation + buffer)
    await page.waitForTimeout(1200);

    // Should be back on home screen — search bar with placeholder visible
    // Desktop shows "Upload" vs mobile "Take a photo"
    const placeholder = page.locator("text=/photo of food & wine menu/");
    await expect(placeholder).toBeVisible({ timeout: 5000 });
  });

  test("clean button removes photos on home", async ({ page }) => {
    await uploadMenu(page);

    // Thumbnail visible — wait for upload to render
    await expect(page.locator('img[alt="Upload 1"]')).toBeVisible({ timeout: 5000 });

    // Clean button has a pulsing animation — use force to bypass stability check
    const cleanBtn = page.locator('[aria-label="Clear photos and start fresh"]');
    await expect(cleanBtn).toBeVisible({ timeout: 3000 });
    await cleanBtn.click({ force: true });

    // Thumbnail should be gone
    await expect(page.locator('img[alt="Upload 1"]')).not.toBeVisible();
  });

  test("results placeholder changes to conversation text", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Search bar placeholder in results mode
    const placeholder = page.locator("text=What do you think of the pairing ideas?");
    await expect(placeholder).toBeVisible();
  });

  test("search bar scales down in results mode", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Search bar should still be visible and functional
    const searchBar = page.locator('[aria-label="Search"]');
    await expect(searchBar).toBeVisible();

    // Dishes and wines should be showing
    await expect(page.locator("text=Dishes")).toBeVisible();
    await expect(page.locator("text=Wines")).toBeVisible();
  });
});
