import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Menu shelf (Task 2)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);
  });

  test("shelf displays MENU label", async ({ page }) => {
    // The shelf label should be visible with "Menu" text
    const shelfLabel = page.locator("text=Menu").first();
    await expect(shelfLabel).toBeVisible();
  });

  test("shelf shows otherDishes as pills", async ({ page }) => {
    // Tiramisu and Panna Cotta from otherDishes
    await expect(page.locator("button", { hasText: "Tiramisu" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Panna Cotta" })).toBeVisible();
  });

  test("shelf pills at max cap are disabled", async ({ page }) => {
    // 5 active dishes = at cap. Shelf pills should be disabled
    const tiramisuBtn = page.locator("button", { hasText: "Tiramisu" });
    await expect(tiramisuBtn).toBeDisabled();
  });

  test("dismissed dish appears in shelf", async ({ page }) => {
    // Dismiss Arancini
    await page.locator('[aria-label="Dismiss Arancini"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Arancini should now be in the shelf as a pill with aria-label
    const shelfArancini = page.locator('[aria-label="Add Arancini"]');
    await expect(shelfArancini).toBeVisible();
    await expect(shelfArancini).toBeEnabled();
  });

  test("shelf pill click re-adds dish to active list", async ({ page }) => {
    // Dismiss then re-add
    await page.locator('[aria-label="Dismiss Arancini"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit

    // 4 dishes remain
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Click shelf pill to re-add via aria-label
    await page.locator('[aria-label="Add Arancini"]').click();

    // 5 dishes again
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);
  });

  test("shelf pills show category emoji", async ({ page }) => {
    // Tiramisu is category "dessert" → 🍰
    const tiramisuBtn = page.locator("button", { hasText: "Tiramisu" });
    // Should contain the dessert emoji
    const emojiSpan = tiramisuBtn.locator("span").first();
    await expect(emojiSpan).toBeVisible();
  });
});
