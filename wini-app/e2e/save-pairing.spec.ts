import { test, expect } from "@playwright/test";
import { mockAnalyzeAPI, mockWineInfoAPI, uploadMenu, waitForResults, submitSearch, savePairing, dismissCookieConsent } from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Save Pairing", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("wini_sessions");
      localStorage.removeItem("wini_favorites");
    });

    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);
  });

  test("Save button visible in results view", async ({ page }) => {
    await expect(page.locator('[aria-label="Save this pairing"]')).toBeVisible();
  });

  test("clicking Save changes to Saved state", async ({ page }) => {
    await page.locator('[aria-label="Save this pairing"]').click();
    await expect(page.locator('[aria-label="Remove saved pairing"]')).toBeVisible();
    await expect(page.locator('[aria-label="Remove saved pairing"]')).toContainText("Saved");
  });

  test("saved session appears in hamburger menu Previous Pairings", async ({ page }) => {
    await savePairing(page);

    // Open hamburger menu
    const menuBtn = page.getByLabel("Open menu");
    await menuBtn.click();
    await page.waitForTimeout(400);

    // Click Previous Pairings
    await page.locator("text=Previous Pairings").click();
    await page.waitForTimeout(300);

    // The session preview (first dish name) should appear
    await expect(page.locator("text=Arancini").last()).toBeVisible();
  });

  test("unsave toggles back to Save state", async ({ page }) => {
    await savePairing(page);

    // Click "Saved" to unsave
    await page.locator('[aria-label="Remove saved pairing"]').click();
    await expect(page.locator('[aria-label="Save this pairing"]')).toBeVisible();
  });

  test("unsaved session removed from Previous Pairings", async ({ page }) => {
    await savePairing(page);

    // Unsave
    await page.locator('[aria-label="Remove saved pairing"]').click();
    await expect(page.locator('[aria-label="Save this pairing"]')).toBeVisible();

    // Open menu and check Previous Pairings
    const menuBtn = page.getByLabel("Open menu");
    await menuBtn.click();
    await page.waitForTimeout(400);

    await page.locator("text=Previous Pairings").click();
    await page.waitForTimeout(300);

    await expect(page.locator("text=No saved pairings yet")).toBeVisible();
  });

  test("new search resets Save button to unsaved", async ({ page }) => {
    await savePairing(page);

    // Full reload to simulate starting a new search from scratch
    // (the saved session persists in localStorage)
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Save button should be in unsaved state (new session, not the saved one)
    await expect(page.locator('[aria-label="Save this pairing"]')).toBeVisible();
  });

  test("restoring saved pairing shows Saved state", async ({ page }) => {
    await savePairing(page);

    // Open menu → Previous Pairings → click session
    const menuBtn = page.getByLabel("Open menu");
    await menuBtn.click();
    await page.waitForTimeout(400);

    await page.locator("text=Previous Pairings").click();
    await page.waitForTimeout(300);

    // Click the session to restore it
    const sessionRow = page.locator(".group").filter({ hasText: "Arancini" }).last();
    await sessionRow.click();
    await page.waitForTimeout(500);

    // Should show "Saved" state (already saved)
    await expect(page.locator('[aria-label="Remove saved pairing"]')).toBeVisible();
  });
});
