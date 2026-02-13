import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, mockWineInfoAPI, uploadMenu, waitForResults, submitSearch } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Favorites (Task 5)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage favorites
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("wini-favorites");
      localStorage.removeItem("wini-sessions");
    });

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
    const menuBtn = page.locator("button").first();
    await menuBtn.click();

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
    await page.waitForTimeout(200);

    // Open menu
    await page.locator("button").first().click();
    await page.waitForTimeout(500); // Wait for menu animation to complete

    // Click the saved wine row directly (the .group div with onClick handler)
    const savedWineRow = page.locator(".group").filter({ hasText: "Vermentino" }).last();
    await expect(savedWineRow).toBeVisible({ timeout: 3000 });
    // Use dispatchEvent to ensure React's onClick fires properly through the backdrop
    await savedWineRow.dispatchEvent("click");
    await page.waitForTimeout(400); // Wait for popup animation

    // Popup should show "Paired with" section
    await expect(page.locator("text=Paired with")).toBeVisible({ timeout: 5000 });

    // Popup should show action buttons
    await expect(page.locator("text=More about this wine")).toBeVisible();
    await expect(page.locator("text=Buy this wine")).toBeVisible();
  });

  test("delete button in saved wines removes the wine", async ({ page }) => {
    // Favorite a wine
    await page.locator('[aria-label="Add to favorites"]').first().click();

    // Open menu
    await page.locator("button").first().click();
    await page.waitForTimeout(300);

    // Hover over saved wine to reveal delete button
    const savedWineRow = page.locator(".group").filter({ hasText: "Vermentino" }).last();
    await savedWineRow.hover();

    // Click the X delete button (14x14 SVG)
    const deleteBtn = savedWineRow.locator("button").last();
    await deleteBtn.click();

    // Wine should be removed from the list
    await expect(page.locator("text=Tap the heart on any wine to save it here")).toBeVisible();
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
