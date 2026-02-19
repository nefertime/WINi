import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch } from "./helpers";
import { WINO_MENU_RESPONSE, REGEN_RESPONSE, REGEN_CAPRESE_RESPONSE, REGEN_FULL_RESPONSE } from "./fixtures/mock-data";

test.describe("Regeneration", () => {
  test("regenerate button appears next to search bar when needed", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Dismiss a dish and re-add to trigger needsRegeneration
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    await page.locator('[aria-label="Add Caprese Salad"]').click();

    // Regenerate button should appear near search bar
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible();
    await expect(regenBtn).toHaveClass(/rounded-full/);
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

  test("clicking regenerate shows spinning icon and calls API", async ({ page }) => {
    let apiCalled = false;

    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for regeneration with correct Caprese response
    await page.route("**/api/analyze", async (route) => {
      apiCalled = true;
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_CAPRESE_RESPONSE),
      });
    });

    // Trigger regen need
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
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

  test("after regen completes, button disappears", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for regeneration
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_CAPRESE_RESPONSE),
      });
    });

    // Dismiss → re-add → regen
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
    await page.locator('[aria-label="Add Caprese Salad"]').click();

    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible();
    await regenBtn.click();

    // Button should disappear after regen completes (needsRegeneration → false)
    await expect(regenBtn).not.toBeVisible({ timeout: 5000 });
  });

  test("re-added dish gets wine pairings after regen", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for regeneration
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_CAPRESE_RESPONSE),
      });
    });

    // Dismiss Caprese → re-add → regen
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
    await page.locator('[aria-label="Add Caprese Salad"]').click();

    await page.locator('[aria-label*="Regenerate"]').click();

    // Wait for regen to complete (button disappears)
    await expect(page.locator('[aria-label*="Regenerate"]')).not.toBeVisible({ timeout: 5000 });

    // Caprese should still be visible as a dish
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);

    // Etna Rosato wine card should be visible (from REGEN_CAPRESE_RESPONSE)
    await expect(page.locator("text=Etna Rosato").first()).toBeVisible();
  });

  test("add shelf dish (Tiramisu) → regen → new wine appears", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for Tiramisu regeneration
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_RESPONSE),
      });
    });

    // Add Tiramisu from shelf
    await page.locator('[aria-label="Add Tiramisu"]').click();

    // Regen button should appear (Tiramisu has no pairings)
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible();
    await regenBtn.click();

    // Wait for regen to complete
    await expect(regenBtn).not.toBeVisible({ timeout: 5000 });

    // Moscato d'Asti should now be visible
    await expect(page.locator("text=Moscato d'Asti").first()).toBeVisible();
  });

  test("full regen (matrix change): dismiss 2, add 2 → regen", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for full regen
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_FULL_RESPONSE),
      });
    });

    // Dismiss 2 dishes (Caprese + one more) to change matrix threshold
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
    await page.locator('[aria-label="Dismiss Arancini"]').click();
    await page.waitForTimeout(350);

    // Now 3 dishes active. Add both shelf desserts → 5 dishes with 2 needing pairings
    await page.locator('[aria-label="Add Tiramisu"]').click();
    await page.locator('[aria-label="Add Panna Cotta"]').click();

    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible();
    await regenBtn.click();

    // Wait for regen to complete
    await expect(regenBtn).not.toBeVisible({ timeout: 5000 });

    // All dishes should have pairings — verify dish count
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);
  });

  test("no infinite spin: regen completes within timeout", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Re-mock for regen
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(REGEN_CAPRESE_RESPONSE),
      });
    });

    // Dismiss → re-add → regen
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);
    await page.locator('[aria-label="Add Caprese Salad"]').click();

    await page.locator('[aria-label*="Regenerate"]').click();

    // Spinning state should not persist — button should be gone within 3s
    await expect(page.locator('[aria-label="Regenerating pairings..."]')).not.toBeVisible({ timeout: 3000 });
    // And the regen button itself should also be gone (no needsRegeneration)
    await expect(page.locator('[aria-label*="Regenerate"]')).not.toBeVisible({ timeout: 1000 });
  });
});
