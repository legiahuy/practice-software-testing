# Playwright Demo Script for Toolshop E-commerce Application

## Overview

This demo showcases Playwright's best features using the Toolshop e-commerce application. The demo is designed to highlight why Playwright is superior to other testing tools and demonstrate its comprehensive capabilities.

## Demo Structure (30-45 minutes)

### 1. Introduction (5 minutes)

**"Why Playwright?"**

- **Automatic Waiting**: Unlike Selenium, Playwright automatically waits for elements to be ready
- **Multi-browser Support**: Test across Chromium, Firefox, and WebKit with the same code
- **Modern Architecture**: Built for modern web applications with JavaScript frameworks
- **Comprehensive Tooling**: Built-in debugging, tracing, and reporting capabilities

### 2. Setup and Installation (3 minutes)

```bash
# Install Playwright
npm init playwright@latest

# Install browsers
npx playwright install

# Install dependencies for the project
cd UI && npm install
cd ../API && composer install
```

### 3. Codegen Demo - Live Recording (5 minutes)

**"Watch Playwright write tests for you!"**

```bash
# Start the application
cd UI && npm start

# In another terminal, start the API
cd API && php artisan serve

# Record a test
npx playwright codegen http://localhost:4200
```

**Demo Steps:**

1. Open codegen in browser
2. Navigate to registration page
3. Fill out the form
4. Show how Playwright generates clean, readable code
5. Save the generated test

**Key Points:**

- No need to write selectors manually
- Supports multiple programming languages
- Generates robust, maintainable code

### 4. Automatic Waiting Demo (3 minutes)

**"No more flaky tests!"**

Show the difference between Selenium and Playwright:

```typescript
// Selenium approach (flaky)
driver.findElement(By.id("button")).click(); // Might fail if element not ready

// Playwright approach (stable)
await page.click("#button"); // Automatically waits for element to be ready
```

**Live Demo:**

- Show a slow-loading page
- Demonstrate how Playwright waits automatically
- Compare with traditional tools that require explicit waits

### 5. Multi-browser Testing (3 minutes)

**"Write once, test everywhere"**

```bash
# Run tests on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

**Demo Points:**

- Same test runs on Chromium, Firefox, and Safari
- Mobile viewport testing
- Responsive design validation

### 6. Inspector and Debugging (5 minutes)

**"Debug like a pro"**

```bash
# Run with inspector
npx playwright test --debug
```

**Demo Features:**

- Step-by-step execution
- Live selector creation
- Network monitoring
- Console inspection
- Screenshot capture at each step

### 7. Trace Viewer Demo (5 minutes)

**"Understand test failures instantly"**

```bash
# Run test with tracing
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace test-results/trace.zip
```

**Demo Points:**

- Show failed test trace
- Navigate through test execution
- View screenshots at each step
- Analyze network requests
- Debug timing issues

### 8. Advanced Features Demo (10 minutes)

#### A. Test Tagging and Selective Execution

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run only registration tests
npx playwright test --grep @registration

# Run tests in parallel
npx playwright test --workers=4
```

#### B. Built-in Reports

```bash
# Generate HTML report
npx playwright show-report

# Generate JUnit XML for CI/CD
npx playwright test --reporter=junit
```

#### C. Video and Screenshot Support

- Show recorded videos of failed tests
- Demonstrate screenshot capture
- Show full-page screenshots

#### D. API Testing

```typescript
// Test API endpoints directly
const response = await request.get("/api/products");
expect(response.status()).toBe(200);
```

#### E. Mobile Testing

```bash
# Test on mobile devices
npx playwright test --project="Mobile Chrome"
```

### 9. Real-world Scenarios (5 minutes)

#### A. End-to-End User Journey

- Registration → Product browsing → Cart → Checkout → Order confirmation
- Show how Playwright handles complex workflows

#### B. Error Handling and Validation

- Form validation testing
- Error message verification
- Edge case handling

#### C. Performance Testing

- Page load time measurement
- Network request monitoring
- Performance regression detection

### 10. Integration with CI/CD (3 minutes)

**"Seamless CI/CD integration"**

```yaml
# GitHub Actions example
- name: Run Playwright tests
  run: npx playwright test --reporter=junit
- name: Upload test results
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: playwright-report/
```

### 11. Q&A and Conclusion (5 minutes)

## Key Talking Points

### Why Playwright is Better Than Selenium:

1. **Automatic Waiting**: No more flaky tests due to timing issues
2. **Modern Architecture**: Built for modern web apps
3. **Better Performance**: Faster execution and more reliable
4. **Comprehensive Tooling**: Built-in debugging, tracing, and reporting
5. **Multi-browser Support**: Same code works across all browsers

### Playwright's Unique Features:

1. **Codegen**: Record tests instead of writing them
2. **Inspector**: Visual debugging tool
3. **Trace Viewer**: Understand test failures instantly
4. **Network Interception**: Mock and modify network requests
5. **Mobile Testing**: Native mobile browser support
6. **API Testing**: Test both UI and API in the same framework

### Best Practices Demonstrated:

1. **Test Organization**: Using tags and describe blocks
2. **Page Object Model**: Clean, maintainable test structure
3. **Parallel Execution**: Fast test execution
4. **Error Handling**: Robust test scenarios
5. **Reporting**: Comprehensive test reports

## Demo Commands Cheat Sheet

```bash
# Basic test execution
npx playwright test

# Run specific test file
npx playwright test playwright-demo-script.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with debug mode
npx playwright test --debug

# Run specific browser
npx playwright test --project=chromium

# Run tests with tags
npx playwright test --grep @smoke

# Generate and show report
npx playwright test --reporter=html
npx playwright show-report

# Record new test
npx playwright codegen http://localhost:4200

# Install browsers
npx playwright install

# Update browsers
npx playwright install --with-deps
```

## Expected Outcomes

After this demo, participants should understand:

1. How Playwright's automatic waiting eliminates flaky tests
2. How to use codegen to create tests quickly
3. How to debug tests using the inspector and trace viewer
4. How to run tests across multiple browsers
5. How to integrate Playwright into CI/CD pipelines
6. Why Playwright is superior to traditional testing tools

## Troubleshooting Tips

- If the application doesn't start, check if ports 4200 and 8000 are available
- If tests fail, check the trace viewer for detailed debugging information
- If browsers aren't installed, run `npx playwright install`
- If you encounter network issues, check the HAR files in test-results/

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Examples](https://github.com/microsoft/playwright/tree/main/tests)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [API Testing Guide](https://playwright.dev/docs/api-testing)
