# Contact Form Automation Testing - Homework Submission

## Project Overview

This project implements comprehensive automation testing for a contact form using Playwright with TypeScript, demonstrating data-driven testing methodology and cross-browser compatibility.

## Key Deliverables

### 1. Test Suite Implementation
- **22 automated test cases** covering all contact form scenarios
- **Page Object Model** architecture for maintainability
- **Data-driven testing** using CSV file for test data
- **Cross-browser support** (Chrome, Firefox, Safari, Mobile)

### 2. Documentation
- **AUTOMATION_REPORT.md**: Comprehensive 10-section report covering:
  - Test case design process
  - Automation implementation details
  - Data-driven testing approach
  - Checkpoints and assertions
  - Cross-browser testing setup
  - Test execution results
  - Reporting implementation
  - Challenges and solutions

### 3. Test Results
- **95.5% pass rate** (21/22 tests passing)
- **1 bug identified**: TC_CONTACT_018 - form accepts invalid subject
- **Screenshot evidence** for all test executions
- **Multiple report formats**: HTML, JSON, CSV

## Running the Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test
CONTACT_TEST_CASES="TC_CONTACT_001" npm test

# View test report
npm run report
```

## Project Structure

```
e2e/
├── src/
│   ├── tests/              # Test specifications
│   ├── page-objects/       # Page Object Model
│   ├── test-data/          # CSV test data (22 test cases)
│   ├── reporters/          # Custom test reporter
│   └── utils/              # Utility functions
├── screenshots/            # Test execution evidence
├── test-files/            # Test attachments
├── README.md              # Setup instructions
├── AUTOMATION_REPORT.md   # Detailed project report
└── playwright.config.ts   # Test configuration
```

## Test Coverage Summary

| Category | Count | Description |
|----------|-------|-------------|
| Valid Inputs | 10 | Successful form submissions |
| Field Validations | 8 | Required fields, formats, lengths |
| File Uploads | 4 | Type and size validations |
| Cross-browser | 4 | Chrome, Firefox, Safari, Mobile |

## Key Features Implemented

1. **Data-Driven Testing**
   - Test data separated in CSV file
   - Dynamic test generation from data
   - Easy test case management

2. **Page Object Model**
   - Encapsulated page interactions
   - Reusable components
   - Maintainable selectors

3. **Custom Reporting**
   - HTML dashboard with statistics
   - JSON for CI/CD integration
   - CSV for data analysis

4. **Environment Configuration**
   - .env file for settings
   - Configurable test selection
   - Browser preferences

## Bug Report

**TC_CONTACT_018**: Form validation bypass
- **Issue**: Form accepts "Error 101: Subject not found" as valid
- **Expected**: Form should reject invalid subject
- **Impact**: Potential data integrity issue
- **Status**: Failed test identifies production bug

## Conclusion

This automation testing project successfully demonstrates:
- Comprehensive test coverage with data-driven approach
- Professional testing framework implementation
- Bug detection capabilities
- Scalable architecture for future expansion

All homework requirements have been fulfilled with detailed documentation and working test suite.