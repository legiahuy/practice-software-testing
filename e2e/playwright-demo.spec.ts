import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Test configuration with all Playwright best features
test.describe.configure({ mode: "parallel" });

// Test tags for grouping and selective execution
test.describe("Toolshop E-commerce Demo @demo", () => {
  let context: any;
  let page: any;

  // Setup with browser context creation (fast isolation)
  test.beforeEach(async ({ browser }) => {
    // Create necessary directories for test artifacts
    const dirs = [
      "test-results/videos",
      "test-results/har",
      "test-results/screenshots",
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Create isolated browser context for each test
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: "test-results/videos/" },
      recordHar: { path: "test-results/har/test.har" },
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    // Take screenshot on failure (automatic screenshot support)
    await page.screenshot({
      path: `test-results/screenshots/${test.info().title}.png`,
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

  // 2. MULTI-BROWSER TESTING DEMO
  test("should work across different browsers @cross-browser", async ({
    browserName,
  }) => {
    await page.goto("http://localhost:4200");

    // Test responsive design across browsers
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("nav")).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("nav")).toBeVisible();

    // Browser-specific assertions
    if (browserName === "chromium") {
      await expect(page.locator(".chrome-specific")).toBeVisible();
    }
  });

  // 3. USER INTERACTION DEMO - Registration flow
  test("should complete user registration successfully @registration", async () => {
    await page.goto("http://localhost:4200");

    // Navigate to registration
    await page.click("text=Sign In");
    await page.click("text=Register");

    // Fill registration form with automatic waiting
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "john.doe@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");
    await page.fill('input[name="phone"]', "+1234567890");

    // Select dropdown values
    await page.selectOption('select[name="country"]', "US");
    await page.selectOption('select[name="state"]', "CA");
    await page.fill('input[name="city"]', "San Francisco");
    await page.fill('input[name="postcode"]', "94102");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify successful registration
    await expect(page.locator(".success-message")).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  // 4. PRODUCT BROWSING AND CART DEMO
  test("should browse products and manage cart @cart", async () => {
    await page.goto("http://localhost:4200");

    // Search for products
    await page.fill('input[placeholder*="Search"]', "hammer");
    await page.click('button:has-text("Search")');

    // Wait for search results
    await expect(page.locator(".product-item")).toHaveCount(1);

    // Add first product to cart
    const firstProduct = page.locator(".product-item").first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    // Verify cart update
    await expect(page.locator(".cart-count")).toHaveText("1");

    // Navigate to cart
    await page.click("text=Cart");

    // Verify product in cart
    await expect(page.locator(".cart-item")).toBeVisible();
    await expect(page.locator(".cart-item")).toContainText("hammer");

    // Update quantity
    await page.locator(".quantity-input").fill("3");
    await page.locator('button:has-text("Update")').click();

    // Remove item
    await page.locator('button:has-text("Remove")').click();
    await expect(page.locator(".cart-item")).not.toBeVisible();
  });

  // 5. CHECKOUT PROCESS DEMO
  test("should complete checkout process @checkout", async () => {
    // First add item to cart
    await page.goto("http://localhost:4200");
    await page
      .locator(".product-item")
      .first()
      .locator('button:has-text("Add to Cart")')
      .click();

    // Start checkout
    await page.click("text=Checkout");

    // Fill billing address
    await page.fill('input[name="billingFirstName"]', "John");
    await page.fill('input[name="billingLastName"]', "Doe");
    await page.fill('input[name="billingAddress"]', "123 Main St");
    await page.fill('input[name="billingCity"]', "San Francisco");
    await page.selectOption('select[name="billingCountry"]', "US");
    await page.fill('input[name="billingPostcode"]', "94102");

    await page.click('button:has-text("Continue")');

    // Select payment method
    await page.click('input[name="paymentMethod"][value="credit-card"]');
    await page.fill('input[name="cardNumber"]', "4111111111111111");
    await page.fill('input[name="expiryDate"]', "12/25");
    await page.fill('input[name="cvv"]', "123");

    await page.click('button:has-text("Place Order")');

    // Verify order confirmation
    await expect(page.locator(".order-confirmation")).toBeVisible();
    await expect(page).toHaveURL(/.*confirmation/);
  });

  // 6. CONTACT FORM DEMO
  test("should submit contact form @contact", async () => {
    await page.goto("http://localhost:4200");

    // Navigate to contact page
    await page.click("text=Contact");

    // Fill contact form
    await page.fill('input[name="firstName"]', "Jane");
    await page.fill('input[name="lastName"]', "Smith");
    await page.fill('input[name="email"]', "jane.smith@example.com");
    await page.selectOption('select[name="subject"]', "Customer Service");
    await page.fill(
      'textarea[name="message"]',
      "This is a test message for the contact form."
    );

    // File upload demo
    await page.setInputFiles('input[type="file"]', {
      name: "test-document.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fake pdf content"),
    });

    // Submit form
    await page.click('button:has-text("Send Message")');

    // Verify success message
    await expect(page.locator(".success-message")).toBeVisible();
  });

  // 7. ERROR HANDLING AND VALIDATION DEMO
  test("should handle form validation errors @validation", async () => {
    await page.goto("http://localhost:4200");

    // Test registration with invalid data
    await page.click("text=Sign In");
    await page.click("text=Register");

    // Submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator(".error-message")).toBeVisible();
    await expect(page.locator("text=First name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();

    // Test invalid email format
    await page.fill('input[name="email"]', "invalid-email");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
  });

  // 8. ACCESSIBILITY TESTING DEMO
  test("should meet accessibility standards @accessibility", async () => {
    await page.goto("http://localhost:4200");

    // Check for proper heading structure
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }

    // Check for form labels
    const inputs = await page.locator("input, select, textarea").all();
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  // 9. PERFORMANCE TESTING DEMO
  test("should load within acceptable time @performance", async () => {
    const startTime = Date.now();

    await page.goto("http://localhost:4200");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors.length).toBe(0);
  });

  // 10. SECURITY TESTING DEMO
  test("should handle security scenarios @security", async () => {
    await page.goto("http://localhost:4200");

    // Test XSS prevention
    const maliciousInput = '<script>alert("XSS")</script>';
    await page.fill('input[name="search"]', maliciousInput);
    await page.click('button:has-text("Search")');

    // Verify script is not executed
    const pageContent = await page.content();
    expect(pageContent).not.toContain("<script>");

    // Test SQL injection prevention
    const sqlInjection = "' OR 1=1 --";
    await page.fill('input[name="email"]', sqlInjection);
    await page.click('button[type="submit"]');

    // Should show validation error, not execute SQL
    await expect(page.locator(".error-message")).toBeVisible();
  });

  // 11. MOBILE RESPONSIVENESS DEMO
  test("should be responsive on mobile devices @mobile", async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:4200");

    // Verify mobile menu works
    await page.click(".mobile-menu-toggle");
    await expect(page.locator(".mobile-menu")).toBeVisible();

    // Test touch interactions
    await page.touchscreen.tap(200, 300);

    // Verify responsive layout
    await expect(page.locator(".product-grid")).toBeVisible();

    // Test swipe gestures (if applicable)
    // await page.touchscreen.swipe(200, 300, 200, 100);
  });

  // 12. API TESTING DEMO
  test("should test API endpoints @api", async ({ request }) => {
    // Test product API
    const productsResponse = await request.get(
      "http://localhost:8000/api/products"
    );
    expect(productsResponse.status()).toBe(200);

    const products = await productsResponse.json();
    expect(Array.isArray(products)).toBe(true);

    // Test user registration API
    const registerResponse = await request.post(
      "http://localhost:8000/api/users/register",
      {
        data: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "Password123!",
        },
      }
    );

    expect(registerResponse.status()).toBe(201);

    // Test authentication
    const loginResponse = await request.post(
      "http://localhost:8000/api/users/login",
      {
        data: {
          email: "test@example.com",
          password: "Password123!",
        },
      }
    );

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeTruthy();
  });

  // 13. VISUAL REGRESSION TESTING DEMO
  test("should maintain visual consistency @visual", async () => {
    await page.goto("http://localhost:4200");

    // Take screenshot of homepage
    await page.screenshot({
      path: "test-results/screenshots/homepage.png",
      fullPage: true,
    });

    // Navigate to product page
    const productItem = page.locator(".product-item").first();
    await productItem.click();
    await page.screenshot({
      path: "test-results/screenshots/product-detail.png",
      fullPage: true,
    });

    // Compare with baseline (you would need baseline images)
    // await expect(page).toHaveScreenshot('homepage.png');
  });

  // 14. STRESS TESTING DEMO
  test("should handle multiple concurrent users @stress", async ({
    browser,
  }) => {
    const numUsers = 5;
    const contexts: any[] = [];
    const pages: any[] = [];

    // Create multiple browser contexts
    for (let i = 0; i < numUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }

    // Simulate concurrent users
    const promises = pages.map(async (page, index) => {
      await page.goto("http://localhost:4200");
      await page.fill('input[placeholder*="Search"]', `product ${index}`);
      await page.click('button:has-text("Search")');
      await expect(page.locator(".product-item")).toBeVisible();
    });

    await Promise.all(promises);

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
  });

  // 15. END-TO-END USER JOURNEY DEMO
  test("should complete full user journey @e2e", async () => {
    // Step 1: Browse products
    await page.goto("http://localhost:4200");
    await expect(page.locator(".product-grid")).toBeVisible();

    // Step 2: Search and filter
    await page.fill('input[placeholder*="Search"]', "tool");
    await page.click('button:has-text("Search")');
    await page.click('input[name="category"][value="hand-tools"]');

    // Step 3: Add to cart
    await page
      .locator(".product-item")
      .first()
      .locator('button:has-text("Add to Cart")')
      .click();
    await expect(page.locator(".cart-count")).toHaveText("1");

    // Step 4: Register account
    await page.click("text=Sign In");
    await page.click("text=Register");
    await page.fill('input[name="firstName"]', "Demo");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', "demo@example.com");
    await page.fill('input[name="password"]', "Demo123!");
    await page.fill('input[name="confirmPassword"]', "Demo123!");
    await page.click('button[type="submit"]');

    // Step 5: Complete checkout
    await page.click("text=Checkout");
    await page.fill('input[name="billingFirstName"]', "Demo");
    await page.fill('input[name="billingLastName"]', "User");
    await page.fill('input[name="billingAddress"]', "123 Demo St");
    await page.fill('input[name="billingCity"]', "Demo City");
    await page.selectOption('select[name="billingCountry"]', "US");
    await page.fill('input[name="billingPostcode"]', "12345");
    await page.click('button:has-text("Continue")');

    await page.click('input[name="paymentMethod"][value="credit-card"]');
    await page.fill('input[name="cardNumber"]', "4111111111111111");
    await page.fill('input[name="expiryDate"]', "12/25");
    await page.fill('input[name="cvv"]', "123");
    await page.click('button:has-text("Place Order")');

    // Step 6: Verify order
    await expect(page.locator(".order-confirmation")).toBeVisible();

    // Step 7: Contact support
    await page.click("text=Contact");
    await page.fill('input[name="firstName"]', "Demo");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', "demo@example.com");
    await page.selectOption('select[name="subject"]', "Customer Service");
    await page.fill(
      'textarea[name="message"]',
      "Great experience with the toolshop!"
    );
    await page.click('button:has-text("Send Message")');

    await expect(page.locator(".success-message")).toBeVisible();
  });
});

// Test retry configuration for flaky tests
test.describe("Flaky Tests @retry", () => {
  test.describe.configure({ retries: 2 });

  test("should handle network delays gracefully", async ({ page }) => {
    await page.goto("http://localhost:4200");

    // Simulate slow network
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.locator(".product-item").first().click();
    await expect(page.locator(".product-detail")).toBeVisible();
  });
});

// Parallel test execution demo
test.describe("Parallel Execution @parallel", () => {
  test.describe.configure({ mode: "parallel" });

  test("parallel test 1", async ({ page }) => {
    await page.goto("http://localhost:4200");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("parallel test 2", async ({ page }) => {
    await page.goto("http://localhost:4200");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("parallel test 3", async ({ page }) => {
    await page.goto("http://localhost:4200");
    await expect(page.locator(".product-grid")).toBeVisible();
  });
});

// Custom reporter demo
test.describe("Custom Reporting @reporting", () => {
  test("should generate detailed test report", async ({ page }) => {
    test.info().annotations.push({
      type: "test-description",
      description: "This test demonstrates custom reporting capabilities",
    });

    await page.goto("http://localhost:4200");

    // Add custom annotations
    test.info().annotations.push({
      type: "step",
      description: "Navigated to homepage",
    });

    await expect(page.locator("h1")).toBeVisible();

    test.info().annotations.push({
      type: "step",
      description: "Verified page title is visible",
    });

    // Add custom metrics
    test.info().attachments.push({
      name: "performance-metrics",
      contentType: "application/json",
      path: "test-results/performance-metrics.json",
    });
  });
});
