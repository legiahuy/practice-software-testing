import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Enhanced Playwright configuration for Contact Form testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/src/tests",

  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,

  /* Test timeout settings */
  timeout: 30 * 1000,

  /* Reporter configuration with custom reporter */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"],
    ["./e2e/src/reporters/test-reporter.ts"],
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

    /* Permissions */
    permissions: ["clipboard-read", "clipboard-write"],

    /* User agent for better debugging */
    userAgent: "Playwright Contact Form Tests",
  },

  /* Test projects for different browsers and devices */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /* Custom Chrome settings */
        launchOptions: {
          args: ["--disable-dev-shm-usage"],
        },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        /* Custom Firefox settings */
        launchOptions: {
          firefoxUserPrefs: {
            "media.navigator.streams.fake": true,
            "media.navigator.permission.disabled": true,
          },
        },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Mobile testing */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Tablet testing */
    {
      name: "iPad",
      use: { ...devices["iPad Pro"] },
    },

    /* Different viewport sizes */
    {
      name: "Desktop 1080p",
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "Desktop 720p",
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  /* Output folder for test artifacts */
  outputDir: "test-results",

  /* Advanced settings */
  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 5000,

    /* Custom matchers */
    toHaveScreenshot: {
      /* Threshold for pixel differences */
      maxDiffPixels: 100,
    },
  },

  /* Folder for test artifacts */
  snapshotDir: "./e2e/screenshots",
  snapshotPathTemplate:
    "{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}",
});
