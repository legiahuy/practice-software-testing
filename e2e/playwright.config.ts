import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Playwright configuration for Contact Form testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/tests",
  
  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // Disable retries to avoid running tests multiple times
  workers: process.env.CI ? 1 : 4,
  
  /* Test timeout settings */
  timeout: 30 * 1000,
  
  /* Reporter configuration with custom reporter */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "on-failure" }],
    ["json", { outputFile: "test-reports/results.json" }],
    ["list"],
    ["./src/reporters/test-reporter.ts"]
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: process.env.BASE_URL || "http://localhost:4200",
    
    /* Tracing, screenshots, and video settings */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    
    /* Browser settings */
    headless: process.env.HEADLESS !== "false",
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Locale and timezone */
    locale: "en-US",
    timezoneId: "America/New_York",
  },
  
  /* Test projects for different browsers and devices */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  
  /* Output folder for test artifacts */
  outputDir: "test-results",
});