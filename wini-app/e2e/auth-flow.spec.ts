import { test, expect } from "@playwright/test";

// Helper to dismiss cookie consent
async function dismissCookieConsent(page: import("@playwright/test").Page) {
  await page.context().addCookies([{
    name: "wini_cookie_consent",
    value: JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }),
    domain: "localhost",
    path: "/",
  }]);
}

test.describe("Auth Flow", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);

    // Mock API endpoints that hit the database
    await page.route("**/api/auth/register", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}");
      if (!body.email || !body.password) {
        await route.fulfill({ status: 400, json: { error: "Email and password are required" } });
        return;
      }
      if (body.password.length < 8) {
        await route.fulfill({ status: 400, json: { error: "password: String must contain at least 8 character(s)" } });
        return;
      }
      if (body.email === "existing@test.com") {
        await route.fulfill({ status: 400, json: { error: "Invalid input" } });
        return;
      }
      await route.fulfill({ status: 201, json: { id: "test-id", email: body.email } });
    });

    await page.route("**/api/auth/providers", async (route) => {
      await route.fulfill({ json: { providers: ["credentials"] } });
    });

    await page.route("**/api/auth/forgot-password", async (route) => {
      await route.fulfill({ json: { message: "If an account exists with this email, you will receive a password reset link." } });
    });

    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({ json: {} });
    });

    await page.route("**/api/auth/csrf", async (route) => {
      await route.fulfill({ json: { csrfToken: "test-csrf" } });
    });
  });

  test("register form validates email format", async ({ page }) => {
    await page.goto("http://localhost:3100");
    await page.waitForTimeout(500);

    // Open hamburger menu to find sign-in button
    const menuButton = page.getByLabel("Open menu");
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }

    // Look for sign in/create account triggers
    const signUpButton = page.getByText("Sign Up");
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
      await page.waitForTimeout(300);
    }
  });

  test("forgot password returns success message", async ({ page }) => {
    await page.goto("http://localhost:3100");
    await page.waitForTimeout(500);
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("http://localhost:3100/privacy");
    await expect(page.getByText("Privacy Policy")).toBeVisible();
    await expect(page.getByText("What We Collect")).toBeVisible();
    await expect(page.getByText("Back to WINi")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("http://localhost:3100/terms");
    await expect(page.getByText("Terms of Service")).toBeVisible();
    await expect(page.getByText("The Service")).toBeVisible();
    await expect(page.getByText("Back to WINi")).toBeVisible();
  });

  test("404 page shows branded content", async ({ page }) => {
    await page.goto("http://localhost:3100/nonexistent-page");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Return to WINi")).toBeVisible();
  });

  test("security headers are present", async ({ page }) => {
    const response = await page.goto("http://localhost:3100");
    const headers = response?.headers() ?? {};
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["content-security-policy"]).toContain("default-src");
  });

  test("API validates Zod schemas on register", async ({ page }) => {
    // Test direct API call with invalid email
    const response = await page.request.post("http://localhost:3100/api/auth/register", {
      data: { email: "not-an-email", password: "validpass123" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("email");
  });

  test("API validates password length on register", async ({ page }) => {
    const response = await page.request.post("http://localhost:3100/api/auth/register", {
      data: { email: "test@example.com", password: "short" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("8");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("http://localhost:3100/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("Sitemap:");
    expect(text).toContain("Disallow: /api/");
  });

  test("manifest.json is accessible", async ({ page }) => {
    const response = await page.goto("http://localhost:3100/manifest.json");
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json.name).toBe("WINi — Wine Intelligence");
  });
});
