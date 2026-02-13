import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch } from "./helpers";
import { WINO_MENU_RESPONSE, REGEN_RESPONSE } from "./fixtures/mock-data";

test.describe("Regeneration (Task 3)", () => {
  test("regenerate button appears next to search bar when needed", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Dismiss a dish and re-add to trigger needsRegeneration
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    await page.locator('[aria-label="Add Caprese Salad"]').click();

    // Regenerate button should appear near search bar (not in results grid)
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible();

    // It should be a round button (w-10 h-10 rounded-full)
    await expect(regenBtn).toHaveClass(/rounded-full/);
  });

  test("clicking regenerate shows spinning icon and calls API", async ({ page }) => {
    let apiCalled = false;

    // First mock for initial load
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for regeneration with a slight delay
    await page.route("**/api/analyze", async (route) => {
      apiCalled = true;
      // Simulate delay
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_RESPONSE),
      });
    });

    // Trigger regen need
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    await page.locator('[aria-label="Add Caprese Salad"]').click();

    // Click regenerate
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await regenBtn.click();

    // Button label should change to regenerating state
    await expect(page.locator('[aria-label="Regenerating pairings..."]')).toBeVisible();

    // Wait for completion
    await page.waitForTimeout(1000);

    expect(apiCalled).toBe(true);
  });

  test("regenerate button NOT visible when no regen needed", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // No regen needed initially
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).not.toBeVisible();
  });
});
