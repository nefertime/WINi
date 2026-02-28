import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
      grepInvert: /Responsive — (Mobile|Tablet)/,
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 393, height: 852 },
      },
      grepInvert: /Responsive — (Desktop|Tablet)/,
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 820, height: 1180 },
        userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        hasTouch: true,
        isMobile: false,
      },
      grepInvert: /Responsive — (Desktop|Mobile)/,
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3100,
    reuseExistingServer: !process.env.CI,
  },
});
