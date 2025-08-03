# Contact Form Test Automation Suite

## Overview

This is a comprehensive, data-driven test automation suite for the Practice Software Testing contact form, built with Playwright and TypeScript. The framework follows industry best practices including Page Object Model (POM), data-driven testing, and comprehensive reporting.

## Architecture

### Framework Components

1. **Test Data Management** (`contact_test_data.csv`)
   - 22 test cases covering positive, negative, and boundary scenarios
   - CSV format for easy maintenance and updates
   - Includes test metadata (ID, title, preconditions, expected results)

2. **Page Object Model** (`ContactPage` class)
   - Encapsulates all contact form interactions
   - Provides reusable methods for form operations
   - Implements robust error handling and validation checks

3. **Test Runner** (`run-contact-tests.ts`)
   - Interactive CLI for test execution
   - Multiple selection options (all, specific, range, positive/negative)
   - Colored console output for better visibility

4. **Main Test Suite** (`contact-form.spec.ts`)
   - Data-driven test execution
   - Automatic screenshot capture for evidence
   - Comprehensive error reporting

## Test Coverage

### Positive Test Scenarios (11 tests)
- Valid form submission with all fields
- Different subject selections (Customer Service, Webmaster, Return, etc.)
- File attachments (TXT, PDF, JPG)
- Boundary value testing (min/max message lengths)

### Negative Test Scenarios (11 tests)
- Empty required fields validation
- Invalid email format
- Message length validation (too short/too long)
- Invalid file types (EXE)
- File size validation

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Chrome, Firefox, or Safari browser

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Verify the test data file exists:
```bash
ls e2e/contact_test_data.csv
```

## Running Tests

### Method 1: Interactive Test Runner (Recommended)

Run the interactive test runner:
```bash
npx ts-node e2e/run-contact-tests.ts
```

This provides options to:
- Run all tests
- Run specific tests by ID
- Run tests by number
- Run only positive/negative tests
- Run tests by range

### Method 2: Direct Playwright Commands

Run all contact form tests:
```bash
npx playwright test contact-form.spec.ts
```

Run specific tests by ID:
```bash
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_003" npx playwright test contact-form.spec.ts
```

Run in specific browser:
```bash
npx playwright test contact-form.spec.ts --project=firefox
```

Run with UI mode (interactive):
```bash
npx playwright test contact-form.spec.ts --ui
```

### Method 3: npm Scripts

Add these to your package.json:
```json
{
  "scripts": {
    "test:contact": "playwright test contact-form.spec.ts",
    "test:contact:ui": "playwright test contact-form.spec.ts --ui",
    "test:contact:debug": "playwright test contact-form.spec.ts --debug",
    "test:contact:runner": "ts-node e2e/run-contact-tests.ts"
  }
}
```

## Test Data Structure

The CSV file contains the following columns:
- `test_id`: Unique test identifier
- `title`: Test case description
- `precondition`: Test prerequisites (logged in/out state)
- `first_name`: First name input value
- `last_name`: Last name input value
- `email`: Email input value
- `subject`: Subject dropdown value
- `message`: Message textarea value
- `attachment`: File attachment name
- `expected_result`: Expected test outcome
- `should_pass`: Boolean indicating if test should succeed

## Customizing Test Data

### Adding New Test Cases

1. Open `contact_test_data.csv`
2. Add a new row with all required columns
3. Use appropriate values for the `subject` field:
   - `customer-service`
   - `webmaster`
   - `return`
   - `payments`
   - `warranty`
   - `status-of-order`

### Modifying Existing Tests

1. Locate the test case by ID in the CSV
2. Update the relevant fields
3. Save the file and run tests

## Test Reports

### HTML Report
After test execution:
```bash
npx playwright show-report
```

### JSON Report
Location: `test-results/results.json`

### JUnit XML Report
Location: `test-results/results.xml`

### Screenshots
Location: `e2e/screenshots/[TEST_ID].png`

## Debugging

### Debug Single Test
```bash
npx playwright test contact-form.spec.ts --debug -g "TC_CONTACT_001"
```

### View Test Execution
```bash
npx playwright test contact-form.spec.ts --headed
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## Best Practices Implemented

1. **Page Object Model**: Separation of test logic and page interactions
2. **Data-Driven Testing**: External test data management
3. **Comprehensive Reporting**: Multiple report formats and screenshots
4. **Error Handling**: Graceful failure handling with detailed error messages
5. **Scalability**: Easy to add new test cases without code changes
6. **Maintainability**: Clear structure and documentation
7. **Cross-Browser Support**: Tests run on Chrome, Firefox, and Safari

## Common Issues and Solutions

### Issue: Tests fail with "element not found"
**Solution**: Check if the application is running on the correct port (default: 4200)

### Issue: File upload tests fail
**Solution**: Ensure test files are created in `e2e/test-files/` directory

### Issue: Login-based tests are skipped
**Solution**: Implement the login functionality in the test setup

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Contact Form Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:contact
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            e2e/screenshots/
```

## Future Enhancements

1. **API Integration**: Add API tests for contact form submission
2. **Performance Testing**: Measure form submission response times
3. **Accessibility Testing**: Add automated accessibility checks
4. **Visual Regression**: Implement screenshot comparison
5. **Database Validation**: Verify data persistence after submission
6. **Email Validation**: Check if contact emails are sent correctly

## Maintenance

### Weekly Tasks
- Review failed tests from CI/CD runs
- Update test data for new requirements
- Check for Playwright updates

### Monthly Tasks
- Review test coverage metrics
- Optimize slow-running tests
- Update documentation

## Contact

For questions or issues with this test suite, please create an issue in the repository or contact the QA team.

---

Built with expertise from 20+ years of experience in test automation at leading tech companies.