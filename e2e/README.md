# E2E Test Suite - Practice Software Testing

This directory contains the Playwright end-to-end test automation suite for the Practice Software Testing application.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific feature
npm run test:contact    # Contact form tests
npm run test:checkout   # Checkout flow tests

# View test report
npm run report
```

## Project Structure

```
e2e/
├── src/
│   ├── page-objects/     # Page Object Model classes
│   ├── tests/           # Test specifications
│   ├── test-data/       # CSV test data files
│   ├── utils/           # Helper utilities
│   └── reporters/       # Custom test reporters
├── test-files/          # Files for upload testing
├── test-reports/        # Test execution results
├── screenshots/         # Failure screenshots
└── playwright.config.ts # Playwright configuration
```

## Key Features

- **Page Object Model** architecture for maintainability
- **Data-driven testing** with CSV files
- **Cross-browser support** (Chrome, Firefox, Edge, Safari)
- **Parallel execution** for faster test runs
- **Custom reporting** with detailed test results
- **Screenshot capture** on test failures

## Documentation

For comprehensive documentation, see:
- [Automation Testing Report](../AUTOMATION_TESTING_REPORT.md) - Complete project overview
- [Bug Report Summary](../BUG_REPORT_SUMMARY.md) - All discovered bugs
- [Test Case Documentation](../TEST_CASE_DOCUMENTATION.md) - Detailed test cases

## Test Results

- **Total Test Cases:** 50
- **Pass Rate:** 90%
- **Bugs Found:** 5
- **Execution Time:** ~5.4 minutes