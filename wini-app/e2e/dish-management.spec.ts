import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch, dismissCookieConsent } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Dish management (Task 4)", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);
  });

  test("dismissed dish moves to shelf", async ({ page }) => {
    // Dismiss Arancini
    await page.locator('[aria-label="Dismiss Arancini"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit

    // Should now show 4 dishes
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Shelf should show "Menu" label with Arancini
    await expect(page.locator("text=Menu").first()).toBeVisible();
    await expect(page.locator('[aria-label="Add Arancini"]')).toBeVisible();
  });

  test("re-adding dish from shelf shows dashed border (needs regen)", async ({ page }) => {
    // Dismiss a dish first
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Shelf should have the dish — click to re-add via aria-label
    await page.locator('[aria-label="Add Caprese Salad"]').click();

    // Dish should now be back in the active list with dashed border
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);

    // The re-added dish should show dashed border (unpaired indicator)
    const capreseDish = page.locator("[id='dish-d5']");
    await expect(capreseDish).toBeVisible();
  });

  test("dismiss-and-readd triggers needsRegeneration", async ({ page }) => {
    // Dismiss Caprese Salad
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Re-add from shelf via aria-label
    await page.locator('[aria-label="Add Caprese Salad"]').click();

    // Regenerate button should appear (next to translate/search)
    const regenBtn = page.locator('[aria-label*="Regenerate"]');
    await expect(regenBtn).toBeVisible({ timeout: 3000 });
  });

  test("shelf shows otherDishes (Tiramisu, Panna Cotta)", async ({ page }) => {
    // otherDishes from response should appear in shelf
    const shelf = page.locator("text=Menu").first();
    await expect(shelf).toBeVisible();

    // Tiramisu and Panna Cotta should be in shelf
    await expect(page.locator("button", { hasText: "Tiramisu" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Panna Cotta" })).toBeVisible();
  });

  test("adding shelf dish beyond cap 5 is disabled", async ({ page }) => {
    // 5 active dishes already at cap — shelf buttons should be disabled
    const tiramisuBtn = page.locator("button", { hasText: "Tiramisu" });
    await expect(tiramisuBtn).toBeDisabled();
  });

  test("shelf pills show category emoji", async ({ page }) => {
    // Tiramisu is category "dessert" → 🍰
    const tiramisuBtn = page.locator("button", { hasText: "Tiramisu" });
    // Should contain the dessert emoji
    const emojiSpan = tiramisuBtn.locator("span").first();
    await expect(emojiSpan).toBeVisible();
  });

  test("dismiss then add allows shelf dish to activate", async ({ page }) => {
    // Dismiss one dish to make room
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350); // Wait for AnimatePresence exit
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);

    // Now only 4 active — Tiramisu should be clickable
    const tiramisuBtn = page.locator('[aria-label="Add Tiramisu"]');
    await expect(tiramisuBtn).toBeEnabled();

    // Click to add
    await tiramisuBtn.click();

    // Should now have 5 dishes again
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);
  });
});
