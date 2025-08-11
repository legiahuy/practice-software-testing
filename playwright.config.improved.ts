import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Improved configuration to ensure consistent test results across browsers
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",

  // OPTION 1: Disable parallel execution within each project
  // This ensures tests run sequentially per browser
  fullyParallel: false,

  // OPTION 2: If you want to keep parallel execution, use test isolation
  // fullyParallel: true,

  forbidOnly: !!process.env.CI,
  retries: Number(process.env.TEST_RETRIES) || 0,

  // Reduce workers to minimize resource contention
  workers: 4,

  reporter: [
    ["html", { outputFolder: "./e2e/playwright-report", open: "never" }],
    ["json", { outputFile: "./e2e/test-reports/results.json" }],
    ["list"],
    ["./e2e/src/reporters/test-reporter.ts"],
  ],

  // Increase timeout to accommodate slower browsers
  timeout: Number(process.env.TEST_TIMEOUT) || 30000,

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: process.env.HEADLESS !== "false",
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: "en-US",
    timezoneId: "America/New_York",

    // Add action timeout for slower browsers
    actionTimeout: 10000,

    // Add navigation timeout
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Browser-specific timeout adjustments if needed
        // timeout: 30000,
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox often needs more time
        launchOptions: {
          slowMo: 100, // Add slight delay between actions
        },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  outputDir: "../test-results",

  // OPTION 3: Use test.describe.configure() in your test files
  // to run specific test suites in serial mode
});
