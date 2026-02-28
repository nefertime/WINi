import { test, expect } from "@playwright/test";
import {
  mockAnalyzeAPI,
  mockWineInfoAPI,
  uploadMenu,
  waitForResults,
  submitSearch,
  cleanState,
} from "./helpers";
import { WINO_MENU_RESPONSE } from "./fixtures/mock-data";

test.describe("Responsive — Desktop (1440×900)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("layout uses full width without excessive empty space", async ({
    page,
  }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const dishCard = page.locator('[id^="dish-"]').first();
    const wineCard = page.locator('[id^="wine-"]').first();

    await expect(dishCard).toBeVisible();
    await expect(wineCard).toBeVisible();

    const dishBox = await dishCard.boundingBox();
    const wineBox = await wineCard.boundingBox();

    expect(dishBox).not.toBeNull();
    expect(wineBox).not.toBeNull();

    expect(dishBox!.width).toBeGreaterThan(200);
    expect(wineBox!.width).toBeGreaterThan(200);

    // Grid should span a reasonable portion of the viewport
    const gridRight = (wineBox!.x + wineBox!.width);
    expect(gridRight).toBeGreaterThan(1440 * 0.5);
  });

  test("FloatingHints visible and positioned correctly", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await page.goto("/");

    // On home screen, floating hints should be visible
    const hint = page.locator("text=/photo|upload/i").first();
    await expect(hint).toBeVisible();
  });

  test("bottle carousel hover info popup works", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await page.goto("/");

    // Click the wine information button on the bottle carousel
    const infoButton = page.locator('[aria-label="Wine information"]').first();
    await expect(infoButton).toBeVisible();
    await infoButton.click({ force: true });

    await page.waitForTimeout(300);

    // The info popup with Vivino link should be visible
    const popup = page.locator('text="Find on Vivino"').first();
    await expect(popup).toBeVisible();

    // Popup should be within viewport bounds
    const popupBox = await popup.boundingBox();
    expect(popupBox).not.toBeNull();
    expect(popupBox!.x + popupBox!.width).toBeLessThanOrEqual(1440);
  });

  test("HamburgerMenu favorite popup positions to the right", async ({
    page,
  }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    // Favorite the first wine (Vermentino di Sardegna)
    const heartButton = page.locator('[aria-label="Add to favorites"]').first();
    await heartButton.click({ force: true });

    await page.waitForTimeout(300);

    // Open hamburger menu
    const menuButton = page.getByLabel("Open menu");
    await menuButton.click({ force: true });

    await page.waitForTimeout(400);

    // Click the Vermentino saved wine row
    const savedWineRow = page.locator(".group").filter({ hasText: /Vermentino/i }).first();
    await expect(savedWineRow).toBeVisible();

    // Use dispatchEvent for elements that may be behind the menu backdrop
    await savedWineRow.dispatchEvent("click");

    await page.waitForTimeout(400);

    // The "Paired with" popup should be visible
    const pairedWithPopup = page.locator('text="Paired with"').first();
    await expect(pairedWithPopup).toBeVisible();

    // Popup should be positioned to the right of the menu, not overlapping it
    const popupBox = await pairedWithPopup.boundingBox();
    expect(popupBox).not.toBeNull();
    expect(popupBox!.x).toBeGreaterThan(250);
  });

  test("wine cards and dish cards at comfortable size", async ({ page }) => {
    await page.goto("/");
    await cleanState(page);
    await mockAnalyzeAPI(page, WINO_MENU_RESPONSE);
    await mockWineInfoAPI(page);
    await page.goto("/");
    await uploadMenu(page);
    await submitSearch(page);
    await waitForResults(page);

    const firstWineCard = page.locator('[id^="wine-"]').first();
    const firstDishCard = page.locator('[id^="dish-"]').first();

    await expect(firstWineCard).toBeVisible();
    await expect(firstDishCard).toBeVisible();

    const wineBox = await firstWineCard.boundingBox();
    const dishBox = await firstDishCard.boundingBox();

    expect(wineBox).not.toBeNull();
    expect(dishBox).not.toBeNull();

    // Cards should be at a comfortable reading size on desktop
    expect(wineBox!.width).toBeGreaterThanOrEqual(150);
    expect(wineBox!.height).toBeGreaterThanOrEqual(40);

    expect(dishBox!.width).toBeGreaterThanOrEqual(150);
    expect(dishBox!.height).toBeGreaterThanOrEqual(40);
  });
});
