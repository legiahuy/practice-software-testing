import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { parse } from 'csv-parse/sync';

// Test configuration with all Playwright best features
test.describe.configure({ mode: "parallel" });

// Test tags for grouping and selective execution
test.describe("Toolshop E-commerce Demo @demo", () => {
  let context: any;
  let page: any;

  // Setup with browser context creation (fast isolation)
  test.beforeEach(async ({ browser }) => {
    // Get test info for organizing artifacts
    const testInfo = test.info();
    const testTags = testInfo.tags;

    // Extract primary tag for folder organization
    const primaryTag =
      testTags.find((tag) => tag.startsWith("@"))?.replace("@", "") ||
      "default";

    // Create organized directory structure for each test tag
    const baseDir = `test-results/${primaryTag}`;
    const dirs = [
      `${baseDir}/videos`,
      `${baseDir}/har`,
      `${baseDir}/screenshots`,
      `${baseDir}/traces`,
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Create isolated browser context for each test
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: `${baseDir}/videos/` },
      recordHar: {
        path: `${baseDir}/har/${testInfo.title.replace(/\s+/g, "-")}.har`,
      },
      // Note: Trace recording is enabled via --trace flag or playwright.config.ts
      // Run with: npx playwright test --grep @trace --trace on
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    // Get test info for organized artifact paths
    const testInfo = test.info();
    const testTags = testInfo.tags;
    const primaryTag =
      testTags.find((tag) => tag.startsWith("@"))?.replace("@", "") ||
      "default";
    const baseDir = `test-results/${primaryTag}`;

    // Take screenshot on failure (automatic screenshot support)
    await page.screenshot({
      path: `${baseDir}/screenshots/${testInfo.title.replace(/\s+/g, "-")}.png`,
      fullPage: true,
    });
    await context.close();
  });

  // 1. AUTOMATIC WAITING DEMO - No explicit waits needed
  test("should navigate to homepage and verify elements are ready @autowait", async () => {
    // Set up slow network BEFORE navigation to demonstrate automatic waiting
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 2000); // 2 second delay for all requests
    });

    // Playwright automatically waits for elements to be ready
    await page.goto("http://localhost:4200");

    // These assertions work without explicit waits - Playwright waits automatically
    // Even with 2-second delays, no manual wait() calls are needed
    await expect(page.locator("#navbarSupportedContent")).toBeVisible();
    await expect(page.getByText("Filters Combination Pliers $")).toBeVisible();
    await expect(page.getByText("SorthName (A - Z)Name (Z - A)")).toBeVisible();
    await expect(
      page.getByRole("paragraph").filter({ hasText: /^$/ }).getByRole("img")
    ).toBeVisible();

    // Verify search functionality is ready
    await expect(page.locator('[data-test="search-query"]')).toBeVisible();
    await expect(page.locator('[data-test="search-submit"]')).toBeVisible();
  });

  // 2. COMPREHENSIVE MULTI-BROWSER TESTING DEMO
  test("should demonstrate write-once-test-everywhere @multi-browser", async ({
    browserName,
  }) => {
    // Same test code runs on Chromium, Firefox, and Safari
    await page.goto("http://localhost:4200");

    // 1. Test responsive design validation
    const viewports = [
      { width: 1920, height: 1080, name: "Desktop" },
      { width: 1024, height: 768, name: "Tablet" },
      { width: 375, height: 667, name: "Mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      console.log(`Testing ${viewport.name} viewport on ${browserName}`);

      // Verify navigation is always accessible based on viewport
      if (viewport.width >= 768) {
        // Desktop and tablet: check for expanded navigation
        await expect(page.locator("#navbarSupportedContent")).toBeVisible();
      } else {
        // Mobile: check for hamburger menu button
        await expect(
          page.getByRole("button", { name: "Toggle navigation" })
        ).toBeVisible();
      }

      if (viewport.width >= 1024) {
        // Test search functionality across viewports
        await page.locator('[data-test="search-query"]').click();
        await page.locator('[data-test="search-query"]').fill("hammer");
        await page.locator('[data-test="search-submit"]').click();
        await expect(page.locator('[data-test="search-term"]')).toContainText(
          "hammer"
        );
      }
    }

    // 2. Browser-specific feature testing
    await page.goto("http://localhost:4200/#/auth/login");

    if (browserName === "chromium") {
      // Test Chrome-specific features
      console.log("Testing Chrome-specific features");

      // Test Chrome's autofill capabilities
      await page.locator('[data-test="email"]').fill("test@example.com");
      await page.locator('[data-test="password"]').fill("password123");

      // Chrome has better autofill support
      await expect(page.locator('[data-test="email"]')).toHaveValue(
        "test@example.com"
      );

      // Test Chrome's smooth scrolling behavior
      await page.evaluate(() => {
        window.scrollTo({ top: 500, behavior: "smooth" });
      });
      await page.waitForTimeout(1000); // Wait for smooth scroll
    } else if (browserName === "firefox") {
      // Test Firefox-specific features
      console.log("Testing Firefox-specific features");

      // Firefox has different form validation behavior
      await page.locator('[data-test="email"]').fill("invalid-email");
      await page.locator('[data-test="password"]').fill("wrong-password");
      await page.locator('[data-test="login-submit"]').click();

      // Firefox shows validation errors differently - check for error message
      await expect(
        page.locator("text=Invalid email or password")
      ).toBeVisible();

      // Test Firefox's scroll behavior
      await page.evaluate(() => {
        window.scrollTo(0, 300);
      });
    } else if (browserName === "webkit") {
      // Test Safari-specific features
      console.log("Testing Safari-specific features");

      // Safari has different touch behavior on desktop
      await page.locator('[data-test="email"]').fill("safari@example.com");

      // Test Safari's form behavior - check if email field is properly filled
      await expect(page.locator('[data-test="email"]')).toHaveValue(
        "safari@example.com"
      );

      // Test Safari's CSS rendering differences
      const emailInput = page.locator('[data-test="email"]');
      const computedStyles = await emailInput.evaluate((el) => ({
        webkitAppearance: window.getComputedStyle(el).webkitAppearance,
        webkitBorderRadius: window.getComputedStyle(el).webkitBorderRadius,
        webkitBoxShadow: window.getComputedStyle(el).webkitBoxShadow,
      }));

      console.log(`Safari input styles:`, computedStyles);

      // Safari has different CSS rendering
      const element = page.locator("#navbarSupportedContent");
      const backgroundColor = await element.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      console.log(`Safari navbar background: ${backgroundColor}`);
    }

    // Test browser-specific CSS and rendering differences
    await page.goto("http://localhost:4200");
    const searchBox = page.locator('[data-test="search-query"]');
    const searchBoxStyles = await searchBox.evaluate((el) => ({
      borderRadius: window.getComputedStyle(el).borderRadius,
      boxShadow: window.getComputedStyle(el).boxShadow,
      fontFamily: window.getComputedStyle(el).fontFamily,
    }));

    console.log(`${browserName} search box styles:`, searchBoxStyles);

    // Test browser-specific JavaScript behavior
    const jsResult = await page.evaluate(() => {
      // Test browser-specific JavaScript features
      const features = {
        hasIntersectionObserver: typeof IntersectionObserver !== "undefined",
        hasResizeObserver: typeof ResizeObserver !== "undefined",
        hasWebGL: !!window.WebGLRenderingContext,
        userAgent: navigator.userAgent,
      };
      return features;
    });

    console.log(`${browserName} JavaScript features:`, jsResult);

    // 3. Verify core functionality works identically across browsers
    const toggleButton = page.getByRole("button", {
      name: "Toggle navigation",
    });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    await page.locator('[data-test="nav-sign-in"]').click();
    await expect(page).toHaveURL(/.*auth\/login/);

    // Test form interactions (should work the same on all browsers)
    await page
      .locator('[data-test="email"]')
      .fill("customer@practicesoftwaretesting.com");

    await page.locator('[data-test="password"]').fill("welcome01");

    await page.locator('[data-test="login-submit"]').click();
    await expect(page.locator('[data-test="page-title"]')).toContainText(
      "My account"
    );
  });

  // 3. INSPECTOR AND DEBUGGING DEMO
  test("should demonstrate debugging capabilities @debug", async () => {
    // Enable debugging features
    const testInfo = test.info();
    const baseDir = `test-results/debug`;

    await page.goto("http://localhost:4200");

    // Step 1: Network monitoring demonstration
    console.log("🔍 Step 1: Monitoring network requests...");

    // Listen to network requests
    page.on("request", (request) => {
      console.log(`📡 Request: ${request.method()} ${request.url()}`);
    });

    page.on("response", (response) => {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
    });

    // Step 2: Console inspection
    console.log("🔍 Step 2: Monitoring console messages...");

    page.on("console", (msg) => {
      console.log(`💻 Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on("pageerror", (error) => {
      console.log(`❌ Page Error: ${error.message}`);
    });

    // Step 3: Screenshot capture at each step
    console.log("📸 Step 3: Taking screenshots at each step...");
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step1-homepage.png`,
    });

    // Step 4: Live selector creation and testing
    console.log("🎯 Step 4: Testing live selectors...");

    // Test different selector strategies - each as separate action
    const selectors = [
      "text=Sign In",
      '[data-test="nav-sign-in"]',
      'a:has-text("Sign in")',
      "nav >> text=Sign in",
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible();
        console.log(
          `✅ Selector "${selector}": ${isVisible ? "Found" : "Not visible"}`
        );
      } catch (error) {
        console.log(`❌ Selector "${selector}": Failed - ${error.message}`);
      }
    }

    // Step 5: Interactive debugging - navigate to login
    console.log("🔍 Step 5: Navigating to login page...");
    await page.click("text=Sign In");
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step2-login.png`,
    });

    // Step 6: Form interaction debugging - each action separated
    console.log("🔍 Step 6: Testing form interactions...");

    // Test form field selectors - each as separate action
    const formFields = [
      '[data-test="email"]',
      '[data-test="password"]',
      '[data-test="login-submit"]',
    ];

    for (const field of formFields) {
      const element = page.locator(field);
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      console.log(
        `📝 Form field "${field}": Visible=${isVisible}, Enabled=${isEnabled}`
      );
    }

    // Step 7: Fill form with debugging - each action separated
    console.log("🔍 Step 7: Filling form with validation...");

    // Each action is separate so debug mode pauses before each
    await page.locator('[data-test="email"]').fill("debug@example.com");
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step3-email-filled.png`,
    });

    await page.locator('[data-test="password"]').fill("debugpassword");
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step4-password-filled.png`,
    });

    // Step 8: Test form validation - each action separated
    console.log("🔍 Step 8: Testing form validation...");

    // Test invalid email - each action separated
    await page.locator('[data-test="email"]').fill("invalid-email");
    await page.locator('[data-test="login-submit"]').click();
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step5-validation-error.png`,
    });

    // Check for error messages
    const errorMessages = await page
      .locator(".error-message, .alert-danger")
      .allTextContents();
    console.log(`⚠️ Error messages found: ${errorMessages.join(", ")}`);

    // Step 9: Element state inspection
    console.log("🔍 Step 9: Inspecting element states...");

    const emailInput = page.locator('[data-test="email"]');
    const emailState = await emailInput.evaluate((el) => ({
      value: el.value,
      className: el.className,
      ariaInvalid: el.getAttribute("aria-invalid"),
      disabled: el.disabled,
      readonly: el.readOnly,
    }));

    console.log(`📊 Email input state:`, emailState);

    // Step 10: Performance monitoring
    console.log("🔍 Step 10: Monitoring performance...");

    const performanceMetrics = await page.evaluate(() => ({
      loadTime:
        performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded:
        performance.timing.domContentLoadedEventEnd -
        performance.timing.navigationStart,
      firstPaint: performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-paint")?.startTime,
      firstContentfulPaint: performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-contentful-paint")?.startTime,
    }));

    console.log(`⚡ Performance metrics:`, performanceMetrics);

    // Step 11: Accessibility inspection
    console.log("🔍 Step 11: Checking accessibility...");

    const accessibilityInfo = await page.evaluate(() => {
      const form = document.querySelector("form");
      return {
        hasForm: !!form,
        formAction: form?.action,
        formMethod: form?.method,
        hasLabels: document.querySelectorAll("label").length,
        hasAriaLabels: document.querySelectorAll("[aria-label]").length,
        hasAriaDescribedBy:
          document.querySelectorAll("[aria-describedby]").length,
      };
    });

    console.log(`♿ Accessibility info:`, accessibilityInfo);

    // Step 12: Final screenshot and summary
    console.log("🔍 Step 12: Final debugging summary...");
    await page.screenshot({
      path: `${baseDir}/screenshots/debug-step6-final.png`,
      fullPage: true,
    });

    console.log("✅ Debugging demonstration completed!");
    console.log(`📁 Screenshots saved in ${baseDir}/screenshots/ directory`);
    console.log(
      "🔧 Use 'npx playwright test --grep @debug --debug' to run in debug mode"
    );
  });

  // 4. TRACE VIEWER DEMO
  test("should demonstrate trace viewer capabilities @trace", async () => {
    // Enable trace recording
    const testInfo = test.info();
    const baseDir = `test-results/trace`;

    await page.goto("http://localhost:4200");

    // Step 1: Navigate to homepage
    console.log("📝 Step 1: Navigating to homepage...");
    await expect(page.locator("#navbarSupportedContent")).toBeVisible();

    // Step 2: Search for a product
    console.log("📝 Step 2: Searching for a product...");
    await page.locator('[data-test="search-query"]').fill("hammer");
    await page.locator('[data-test="search-submit"]').click();

    // Step 3: Verify search results (this will fail to demonstrate trace viewer)
    console.log("📝 Step 3: Verifying search results...");
    await expect(page.locator('[data-test="search-term"]')).toContainText(
      "hammer"
    );

    // Step 4: Navigate to login (this step won't execute due to failure above)
    console.log("📝 Step 4: Navigating to login...");
    await page.click("text=Sign In");
    await expect(page).toHaveURL(/.*auth\/login/);

    console.log("✅ Trace viewer demonstration completed!");
    console.log(`📁 Trace files will be saved in ${baseDir}/traces/ directory`);
    console.log("🔧 Run with: npx playwright test --grep @trace --trace on");
  });
});

