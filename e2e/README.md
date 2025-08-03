# Practice Software Testing - E2E Automation Suite

## Overview

This automation testing suite provides comprehensive test coverage for the Practice Software Testing application, including Contact Form and Multi-Step Checkout functionality, using Playwright and TypeScript with a data-driven approach.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run contact form tests
npm run test:contact

# Run checkout tests
npm run test:checkout

# Run specific contact tests
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_005" npm run test:contact

# Run specific checkout tests
CHECKOUT_TEST_CASES="TC_CART_001,TC_PAYMENT_001" npm run test:checkout

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
│   │   ├── contact-form.spec.ts
│   │   └── checkout-flow.spec.ts
│   ├── page-objects/       # Page Object Model classes
│   │   ├── ContactPage.ts
│   │   ├── HomePage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutSignInPage.ts
│   │   ├── CheckoutAddressPage.ts
│   │   └── CheckoutPaymentPage.ts
│   ├── test-data/          # CSV test data
│   │   ├── contact_test_data.csv
│   │   └── checkout_test_data.csv
│   ├── reporters/          # Custom test reporters
│   │   └── test-reporter.ts
│   └── utils/              # Utility functions
│       └── TestDataLoader.ts
├── screenshots/            # Test execution evidence
├── test-files/            # Test file attachments
├── test-reports/          # Generated test reports
├── playwright.config.ts   # Playwright configuration
├── package.json          # Dependencies
├── .env.example                  # Environment variables template
├── AUTOMATION_REPORT.md          # Contact form test documentation
├── CHECKOUT_TEST_DOCUMENTATION.md # Checkout test documentation
└── HOMEWORK_SUBMISSION.md        # Project summary
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables as needed:
```env
BASE_URL=http://localhost:4200
CONTACT_TEST_CASES=          # Leave empty for all contact tests
CHECKOUT_TEST_CASES=         # Leave empty for all checkout tests
TEST_USERNAME=customer@practicesoftwaretesting.com
TEST_PASSWORD=welcome01
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Contact Form Tests
```bash
# All contact tests
npm run test:contact

# Single contact test
CONTACT_TEST_CASES="TC_CONTACT_001" npm run test:contact

# Multiple contact tests
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_005,TC_CONTACT_010" npm run test:contact
```

### Checkout Flow Tests
```bash
# All checkout tests
npm run test:checkout

# Cart tests only
npm run test:checkout:cart

# Sign-in tests only  
npm run test:checkout:signin

# Address tests only
npm run test:checkout:address

# Payment tests only
npm run test:checkout:payment

# Single checkout test
CHECKOUT_TEST_CASES="TC_CART_001" npm run test:checkout

# Multiple checkout tests
CHECKOUT_TEST_CASES="TC_CART_001,TC_PAYMENT_001,TC_PAYMENT_010" npm run test:checkout
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

### Contact Form Tests
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

### Checkout Flow Tests
Test cases are defined in `src/test-data/checkout_test_data.csv` with additional fields:

| Field | Description |
|-------|-------------|
| test_step | Which checkout step to test (cart/signin/address/payment/complete) |
| product_ids | Comma-separated product IDs to add to cart |
| quantity_update | Cart quantity actions |
| address | Shipping address |
| city | City name |
| state | State/Province |
| country | Country |
| postcode | Postal code |
| payment_method | Payment type selection |
| account_name | Bank account name (for bank transfer) |
| account_number | Bank account number (for bank transfer) |

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

### Contact Form: 22 test cases covering:

- ✅ Valid form submissions (logged in/out users)
- ✅ Required field validations
- ✅ Email format validation
- ✅ Message length validations (min/max)
- ✅ File upload validations (type/size)
- ✅ Subject selection validations
- ❌ Bug identified: TC_CONTACT_018 (invalid subject accepted)

### Checkout Flow: 27 test cases covering:

- ✅ Cart management (quantity updates, item removal)
- ✅ Sign-in authentication during checkout
- ✅ Address form validations
- ✅ Payment method selections
- ✅ Complete end-to-end checkout flow
- ✅ Error handling for each step

## Development

### Adding New Test Cases

1. Add test data to appropriate CSV file:
   - Contact: `src/test-data/contact_test_data.csv`
   - Checkout: `src/test-data/checkout_test_data.csv`
2. Run tests to verify: `npm test`

### Modifying Page Objects

Page objects are located in `src/page-objects/`:
- Contact form: `ContactPage.ts`
- Homepage: `HomePage.ts`
- Cart: `CartPage.ts`
- Checkout steps: `CheckoutSignInPage.ts`, `CheckoutAddressPage.ts`, `CheckoutPaymentPage.ts`

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

## Documentation

- **Contact Form Tests**: See [AUTOMATION_REPORT.md](AUTOMATION_REPORT.md)
- **Checkout Tests**: See [CHECKOUT_TEST_DOCUMENTATION.md](CHECKOUT_TEST_DOCUMENTATION.md)
- **Project Summary**: See [HOMEWORK_SUBMISSION.md](HOMEWORK_SUBMISSION.md)

## Contact

For issues or questions about this test suite, please refer to the documentation files above.