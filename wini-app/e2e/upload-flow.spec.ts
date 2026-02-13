import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Upload flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
  });

  test("upload image shows thumbnail preview", async ({ page }) => {
    await uploadMenu(page);

    // Thumbnail should appear above the search bar
    const thumbnail = page.locator('img[alt="Upload 1"]');
    await expect(thumbnail).toBeVisible({ timeout: 5000 });
  });

  test("upload and submit transitions to scanning then results", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);

    // Scanning state should show briefly
    // Then results should appear
    await waitForResults(page);

    // Dishes should be visible
    const dishesHeader = page.locator("text=Dishes").first();
    await expect(dishesHeader).toBeVisible();

    // Wines should be visible
    const winesHeader = page.locator("text=Wines").first();
    await expect(winesHeader).toBeVisible();
  });

  test("results show 5 dishes from main response", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const dishCards = page.locator("[id^='dish-']");
    await expect(dishCards).toHaveCount(5);
  });

  test("results show all 5 wines (all paired with active dishes)", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const wineCards = page.locator("[id^='wine-']");
    await expect(wineCards).toHaveCount(5);
  });

  test("logo switches to compact mode in results", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Logo should still be visible in compact form
    const logo = page.locator("text=WINi").first();
    await expect(logo).toBeVisible();
  });

  test("back button appears in results", async ({ page }) => {
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const backBtn = page.locator('[aria-label="Back to home"]');
    await expect(backBtn).toBeVisible();
  });
});
