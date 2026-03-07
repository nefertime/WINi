import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, mockWineInfoAPI, uploadMenu, waitForResults, submitSearch, cleanState, setupAuthenticatedUser } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Favorites (Task 5)", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/");
    await cleanState(page);

    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);
  });

  test("heart icon favorites a wine", async ({ page }) => {
    // Click heart on first wine card
    const heartBtn = page.locator('[aria-label="Add to favorites"]').first();
    await heartBtn.click();

    // Heart should now be filled (remove from favorites label)
    await expect(page.locator('[aria-label="Remove from favorites"]').first()).toBeVisible();
  });

  test("favorited wine appears in hamburger menu Saved Wines", async ({ page }) => {
    // Favorite a wine
    const heartBtn = page.locator('[aria-label="Add to favorites"]').first();
    await heartBtn.click();

    // Open hamburger menu
    await page.getByLabel("Open menu").click();

    // Saved Wines section should auto-expand and show the wine
    await expect(page.locator("text=Saved Wines")).toBeVisible();

    // The wine name should appear in the saved wines list
    // First wine in our mock is Vermentino di Sardegna
    const savedWineInMenu = page.locator("text=Vermentino di Sardegna").last();
    await expect(savedWineInMenu).toBeVisible();
  });

  test("clicking saved wine shows popup WITHOUT redundant wine name", async ({ page }) => {
    // Favorite first wine
    await page.locator('[aria-label="Add to favorites"]').first().click();
    await page.waitForTimeout(300);

    // Open menu
    await page.getByLabel("Open menu").click();
    await page.waitForTimeout(400);

    // Expand the Saved Wines section (menu defaults to "account" section)
    await page.locator("text=Saved Wines").click({ force: true });
    await page.waitForTimeout(400);

    // Find the saved wine row and click — use evaluate to fire React's onClick through any backdrop
    const savedWineRow = page.locator('[role="button"]').filter({ hasText: /Vermentino/i }).last();
    await expect(savedWineRow).toBeVisible({ timeout: 5000 });
    await savedWineRow.evaluate((el) => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(500);

    // Popup should show "Paired with" section
    await expect(page.locator("text=Paired with")).toBeVisible({ timeout: 5000 });

    // Popup should show action buttons
    await expect(page.locator("text=More about this wine")).toBeVisible();
    await expect(page.locator("text=/Buy this wine/")).toBeVisible();
  });

  test("delete button in saved wines removes the wine", async ({ page }) => {
    // Favorite a wine
    await page.locator('[aria-label="Add to favorites"]').first().click();
    await page.waitForTimeout(300);

    // Open menu and expand Saved Wines section
    await page.getByLabel("Open menu").click();
    await page.waitForTimeout(400);
    await page.locator("text=Saved Wines").click({ force: true });
    await page.waitForTimeout(400);

    // Delete button has opacity-0 (hover-only) — use force:true to click it
    const deleteBtn = page.locator('[aria-label*="Remove"][aria-label*="from saved"]').first();
    await expect(deleteBtn).toBeAttached({ timeout: 5000 });
    await deleteBtn.click({ force: true });

    // Wine should be removed from the list
    await expect(page.locator("text=Tap the heart on any wine to save it here")).toBeVisible({ timeout: 5000 });
  });

  test("unfavoriting wine removes filled heart", async ({ page }) => {
    // Favorite then unfavorite
    const heartBtn = page.locator('[aria-label="Add to favorites"]').first();
    await heartBtn.click();

    // Now unfavorite
    const removeBtn = page.locator('[aria-label="Remove from favorites"]').first();
    await removeBtn.click();

    // Should be back to add to favorites
    await expect(page.locator('[aria-label="Add to favorites"]').first()).toBeVisible();
  });
});
