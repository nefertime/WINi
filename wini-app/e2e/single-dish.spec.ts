import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, uploadMenu, waitForResults, submitSearch, dismissCookieConsent } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Single dish filtering (Task 1)", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
  });

  test("dismissing dishes until one remains shows only its paired wines", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Initially 5 dishes, 5 wines
    await expect(page.locator("[id^='dish-']")).toHaveCount(5);
    await expect(page.locator("[id^='wine-']")).toHaveCount(5);

    // Dismiss dishes d2, d3, d4, d5 — leave only Arancini (d1)
    // Arancini pairs with w1, w3, w5 (3 wines)

    // Dismiss Grilled Branzino
    await page.locator('[aria-label="Dismiss Grilled Branzino"]').click();
    await expect(page.locator("[id^='dish-']")).toHaveCount(4);
    await page.waitForTimeout(350); // Wait for AnimatePresence exit

    // Dismiss Osso Buco
    await page.locator('[aria-label="Dismiss Osso Buco"]').click();
    await expect(page.locator("[id^='dish-']")).toHaveCount(3);
    await page.waitForTimeout(350);

    // Dismiss Truffle Pasta
    await page.locator('[aria-label="Dismiss Truffle Pasta"]').click();
    await expect(page.locator("[id^='dish-']")).toHaveCount(2);
    await page.waitForTimeout(350);

    // After 3 dismissals, 2 dishes remain — dismiss buttons still visible
    // Dismiss Caprese Salad (canDismiss = activeDishes > 1, so this works)
    await page.locator('[aria-label="Dismiss Caprese Salad"]').click();
    await page.waitForTimeout(350);

    // Now 1 dish: Arancini
    await expect(page.locator("[id^='dish-']")).toHaveCount(1);

    // Only 3 wines paired with Arancini should be visible
    // w1 (Vermentino), w3 (Etna Rosato), w5 (Soave) — NOT w2 or w4
    await expect(page.locator("[id^='wine-']")).toHaveCount(3);

    // Verify the specific wines
    await expect(page.locator("text=Vermentino di Sardegna")).toBeVisible();
    await expect(page.locator("text=Etna Rosato")).toBeVisible();
    await expect(page.locator("text=Soave Classico")).toBeVisible();

    // w2 (Barolo) and w4 (Brunello) should NOT be visible
    await expect(page.locator("text=Barolo Riserva")).not.toBeVisible();
    await expect(page.locator("text=Brunello di Montalcino")).not.toBeVisible();
  });

  test("wines shared across dishes stay when one dish dismissed", async ({ page }) => {
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // w1 (Vermentino) is shared by d1, d2, d5 — dismissing d1 should keep it
    await page.locator('[aria-label="Dismiss Arancini"]').click();

    // w1 should still be visible (paired with d2 and d5)
    await expect(page.locator("text=Vermentino di Sardegna")).toBeVisible();
  });
});
