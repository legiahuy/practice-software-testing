# Contact Form Automation Testing

## Overview

This automation testing suite provides comprehensive test coverage for the Practice Software Testing application's contact form functionality using Playwright and TypeScript with a data-driven approach.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific tests
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_005" npm test

# Run tests in UI mode
npx playwright test --ui

# Run tests with specific browser
npx playwright test --project=chromium
```

## Project Structure

```
e2e/
├── src/
│   ├── tests/              # Test specifications
│   │   └── contact-form.spec.ts
│   ├── page-objects/       # Page Object Model classes
│   │   └── ContactPage.ts
│   ├── test-data/          # CSV test data
│   │   └── contact_test_data.csv
│   ├── reporters/          # Custom test reporters
│   │   └── test-reporter.ts
│   └── utils/              # Utility functions
│       └── TestDataLoader.ts
├── screenshots/            # Test execution evidence
├── test-files/            # Test file attachments
├── test-reports/          # Generated test reports
├── playwright.config.ts   # Playwright configuration
├── package.json          # Dependencies
├── .env.example         # Environment variables template
└── AUTOMATION_REPORT.md # Detailed project documentation
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables as needed:
```env
BASE_URL=http://localhost:4200
CONTACT_TEST_CASES=          # Leave empty for all tests
TEST_USERNAME=customer@practicesoftwaretesting.com
TEST_PASSWORD=welcome01
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Cases
```bash
# Single test
CONTACT_TEST_CASES="TC_CONTACT_001" npm test

# Multiple tests
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_005,TC_CONTACT_010" npm test

# Run failing tests only
CONTACT_TEST_CASES="TC_CONTACT_003,TC_CONTACT_004,TC_CONTACT_018" npm test
```

### Run with Different Browsers
```bash
# Chrome only
npx playwright test --project=chromium

# All browsers
npx playwright test

# Mobile
npx playwright test --project="Mobile Chrome"
```

### Interactive Mode
```bash
# UI Mode (recommended for debugging)
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Test Data

Test cases are defined in `src/test-data/contact_test_data.csv` with the following structure:

| Field | Description |
|-------|-------------|
| test_id | Unique test identifier |
| title | Test case description |
| precondition | Setup requirements |
| first_name | Test data |
| last_name | Test data |
| email | Test data |
| subject | Dropdown selection |
| message | Text area content |
| attachment | File to upload |
| expected_result | Expected behavior |
| should_pass | true/false for assertions |

## Reports

After test execution, reports are generated in `test-reports/`:

- **HTML Report**: Visual test results with statistics
- **JSON Report**: Machine-readable results
- **CSV Report**: Excel-compatible summary

View HTML report:
```bash
npx playwright show-report
```

## Test Cases Overview

Total: 22 test cases covering:

- ✅ Valid form submissions (logged in/out users)
- ✅ Required field validations
- ✅ Email format validation
- ✅ Message length validations (min/max)
- ✅ File upload validations (type/size)
- ✅ Subject selection validations
- ❌ Bug identified: TC_CONTACT_018 (invalid subject accepted)

## Development

### Adding New Test Cases

1. Add test data to `contact_test_data.csv`
2. Run tests to verify: `npm test`

### Modifying Page Objects

Edit `src/page-objects/ContactPage.ts` to add new page interactions

### Custom Reporting

Modify `src/reporters/test-reporter.ts` to customize report format

## Troubleshooting

### Common Issues

1. **Tests failing with timeout**
   - Increase timeout in playwright.config.ts
   - Check if application is running at BASE_URL

2. **File upload tests failing**
   - Ensure test-files directory exists
   - Check file size limits

3. **Login tests failing**
   - Verify credentials in .env
   - Check authentication endpoint

### Debug Commands

```bash
# Run with debug logs
DEBUG=pw:api npm test

# Run single test with trace
npx playwright test TC_CONTACT_001 --trace on

# View trace
npx playwright show-trace trace.zip
```

## CI/CD Integration

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci
  
- name: Run tests
  run: npm test
  
- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: e2e/test-reports/
```

## Contact

For issues or questions about this test suite, please refer to the AUTOMATION_REPORT.md for detailed documentation.