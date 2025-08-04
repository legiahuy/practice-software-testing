# Test Case Documentation - Practice Software Testing

## Overview
This document provides comprehensive documentation of all test cases implemented for the Practice Software Testing application. The test suite covers two main features: Contact Form and Multi-Step Checkout, with a total of 50 automated test cases.

## Test Case Summary

| Feature | Total Test Cases | Passed | Failed | Pass Rate |
|---------|-----------------|--------|--------|-----------|
| Contact Form | 22 | 22 | 0 | 100% |
| Checkout - Cart | 8 | 5 | 3 | 62.5% |
| Checkout - Sign In | 5 | 5 | 0 | 100% |
| Checkout - Address | 4 | 3 | 1 | 75% |
| Checkout - Payment | 10 | 9 | 1 | 90% |
| **Total** | **50** | **45** | **5** | **90%** |

---

## Contact Form Test Cases

### Valid Submission Tests

#### TC_CONTACT_001: Valid submission with all fields (logged in)
- **Objective:** Verify successful contact form submission with all fields filled by a logged-in user
- **Precondition:** User is logged in
- **Test Data:**
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Subject: Customer service
  - Message: This is a test message for contact form submission
- **Expected Result:** Success message "Thanks for your message! We will contact you shortly."
- **Status:** ✅ PASS

#### TC_CONTACT_002: Valid submission (not logged in)
- **Objective:** Verify successful contact form submission by anonymous user
- **Precondition:** User is not logged in
- **Test Data:**
  - First Name: Jane
  - Last Name: Smith
  - Email: jane.smith@example.com
  - Subject: Webmaster
  - Message: Testing contact form without login
- **Expected Result:** Success message displayed
- **Status:** ✅ PASS

### Field Validation Tests

#### TC_CONTACT_003: Empty first name validation
- **Objective:** Verify error handling for missing first name
- **Test Data:** All fields except first name
- **Expected Result:** Error message "First name is required"
- **Status:** ✅ PASS

#### TC_CONTACT_004: Empty last name validation
- **Objective:** Verify error handling for missing last name
- **Test Data:** All fields except last name
- **Expected Result:** Error message "Last name is required"
- **Status:** ✅ PASS

#### TC_CONTACT_005: Empty email validation
- **Objective:** Verify error handling for missing email
- **Test Data:** All fields except email
- **Expected Result:** Error message "Email is required"
- **Status:** ✅ PASS

#### TC_CONTACT_006: Invalid email format
- **Objective:** Verify error handling for invalid email format
- **Test Data:** Email: "invalid-email"
- **Expected Result:** Error message "Email format is invalid"
- **Status:** ✅ PASS

#### TC_CONTACT_007: Empty subject validation
- **Objective:** Verify error handling for missing subject
- **Test Data:** All fields except subject
- **Expected Result:** Error message "Subject is required"
- **Status:** ✅ PASS

#### TC_CONTACT_008: Empty message validation
- **Objective:** Verify error handling for missing message
- **Test Data:** All fields except message
- **Expected Result:** Error message "Message is required"
- **Status:** ✅ PASS

### Boundary Tests

#### TC_CONTACT_009: Message at minimum length (50 chars)
- **Objective:** Verify acceptance of minimum valid message length
- **Test Data:** Message with exactly 50 characters
- **Expected Result:** Form submitted successfully
- **Status:** ✅ PASS

#### TC_CONTACT_010: Message below minimum length (49 chars)
- **Objective:** Verify rejection of message below minimum length
- **Test Data:** Message with 49 characters
- **Expected Result:** Error message about minimum length
- **Status:** ✅ PASS

#### TC_CONTACT_011: Message at maximum length (250 chars)
- **Objective:** Verify acceptance of maximum valid message length
- **Test Data:** Message with exactly 250 characters
- **Expected Result:** Form submitted successfully
- **Status:** ✅ PASS

#### TC_CONTACT_012: Message above maximum length (251 chars)
- **Objective:** Verify rejection of message above maximum length
- **Test Data:** Message with 251 characters
- **Expected Result:** Error message about maximum length
- **Status:** ✅ PASS

### File Upload Tests

#### TC_CONTACT_013: Valid file upload (.txt)
- **Objective:** Verify successful file upload with valid text file
- **Test Data:** test_400kb.txt
- **Expected Result:** File uploaded successfully
- **Status:** ✅ PASS

#### TC_CONTACT_014: File size limit validation (>500KB)
- **Objective:** Verify rejection of files larger than 500KB
- **Test Data:** test_600mb.txt
- **Expected Result:** Error message "File too large"
- **Status:** ✅ PASS

#### TC_CONTACT_015: Invalid file type (.exe)
- **Objective:** Verify rejection of executable files
- **Test Data:** test.exe
- **Expected Result:** Error message about invalid file type
- **Status:** ✅ PASS

### Edge Cases

#### TC_CONTACT_016-022: Various edge cases
- Special characters in name fields
- Multiple subject selections
- Form resubmission
- Network timeout scenarios
- All tests: ✅ PASS

---

## Checkout Test Cases

### Cart Management (TC_CART_*)

#### TC_CART_001: Update quantity with valid value
- **Objective:** Verify quantity can be updated to valid number
- **Test Data:** Change quantity from 1 to 5
- **Expected Result:** Total recalculates correctly
- **Status:** ✅ PASS

#### TC_CART_002: Update to minimum valid quantity
- **Objective:** Verify quantity can be set to 1
- **Test Data:** Change quantity to 1
- **Expected Result:** Total recalculates correctly
- **Status:** ✅ PASS

#### TC_CART_003: Empty quantity validation
- **Objective:** Verify system blocks checkout with empty quantity
- **Test Data:** Clear quantity field
- **Expected Result:** Validation error prevents checkout
- **Status:** ❌ FAIL - **BUG: System allows checkout with empty quantity**

#### TC_CART_004: Zero quantity validation
- **Objective:** Verify system blocks checkout with zero quantity
- **Test Data:** Set quantity to 0
- **Expected Result:** Validation error or auto-removal
- **Status:** ❌ FAIL - **BUG: System allows checkout with zero quantity**

#### TC_CART_005: Negative quantity validation
- **Objective:** Verify system blocks negative quantities
- **Test Data:** Set quantity to -2
- **Expected Result:** Validation error
- **Status:** ❌ FAIL - **BUG: System allows negative quantity and calculates negative total**

#### TC_CART_006-008: Item removal tests
- Multiple item removal: ✅ PASS
- Single item removal: ✅ PASS
- Empty cart validation: ✅ PASS

### Sign-In Tests (TC_SIGNIN_*)

#### TC_SIGNIN_001: Valid credentials
- **Status:** ✅ PASS

#### TC_SIGNIN_002: Empty email
- **Expected:** "Email is required"
- **Status:** ✅ PASS

#### TC_SIGNIN_003: Invalid email format
- **Expected:** "Email format is invalid"
- **Status:** ✅ PASS

#### TC_SIGNIN_004: Empty password
- **Expected:** "Password is required"
- **Status:** ✅ PASS

#### TC_SIGNIN_005: Incorrect password
- **Expected:** "Invalid email or password"
- **Status:** ✅ PASS

### Address Tests (TC_ADDRESS_*)

#### TC_ADDRESS_001: Valid address submission
- **Test Data:** Complete address with all fields
- **Status:** ✅ PASS

#### TC_ADDRESS_002: Missing address field
- **Expected:** "Address is required"
- **Status:** ✅ PASS

#### TC_ADDRESS_003: Missing city field
- **Expected:** "City is required"
- **Status:** ✅ PASS

#### TC_ADDRESS_004: Minimum input length validation
- **Test Data:** Single character in all fields
- **Expected:** Specific validation message
- **Status:** ❌ FAIL - **BUG: Empty error box displayed with no text**

### Payment Tests (TC_PAYMENT_*)

#### TC_PAYMENT_001-009: Valid payment methods
All standard payment methods tested:
- Bank Transfer: ✅ PASS
- Cash on Delivery: ✅ PASS
- Credit Card: ✅ PASS
- Buy Now Pay Later: ✅ PASS
- Gift Card: ✅ PASS

#### TC_PAYMENT_002-004: Field validation
- No payment method: ✅ PASS
- Empty account name: ✅ PASS
- Empty account number: ✅ PASS

#### TC_PAYMENT_010: Error payment method
- **Test Data:** "Errror 304 - Missing Payment Gateway"
- **Expected:** Error message or payment failure
- **Status:** ❌ FAIL - **CRITICAL BUG: Error payment method allows successful payment**

---

## Bug Summary

### Critical Bugs (1)
1. **BUG-002:** Error payment method allows successful payment (TC_PAYMENT_010)

### High Priority Bugs (1)
2. **BUG-001:** Empty error box for minimum length validation (TC_ADDRESS_004)

### Medium Priority Bugs (3)
3. **BUG-003:** Empty quantity allows checkout (TC_CART_003)
4. **BUG-004:** Zero quantity allows checkout (TC_CART_004)
5. **BUG-005:** Negative quantity allows checkout (TC_CART_005)

---

## Test Execution Instructions

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with appropriate values
```

### Running Tests

#### Run all tests
```bash
npm test
```

#### Run specific feature tests
```bash
# Contact form tests only
npm run test:contact

# Checkout tests only
npm run test:checkout
```

#### Run specific test cases
```bash
# Using environment variable
CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_002" npm test

# Using grep pattern
npm test -- --grep "TC_CART_"
```

#### Run with specific browser
```bash
# Chrome
npm test -- --project=chromium

# Firefox
npm test -- --project=firefox

# All browsers
npm test -- --project=chromium --project=firefox --project=webkit
```

### Debugging Tests
```bash
# Run in headed mode
npm test -- --headed

# Run with debug logs
DEBUG=pw:api npm test

# Run single test with trace
npm test -- --trace on
```

### Viewing Reports
```bash
# Generate and open HTML report
npm run report

# View test results
cat e2e/test-reports/results.json
```

---

## Test Data Management

### CSV File Structure

#### Contact Form Data (contact_test_data.csv)
```csv
test_id,title,first_name,last_name,email,subject,message,attachment,expected_result,should_pass
```

#### Checkout Data (checkout_test_data.csv)
```csv
test_id,title,precondition,test_step,product_ids,quantity_update,email,password,address,city,state,country,postcode,payment_method,account_name,account_number,expected_result,should_pass
```

### Data-Driven Approach
- All test data externalized to CSV files
- Easy modification without code changes
- Supports multiple test scenarios
- Maintains test data version control

---

## Maintenance Guidelines

### Adding New Test Cases
1. Add test case to appropriate CSV file
2. Ensure unique test_id following naming convention
3. Set appropriate should_pass flag
4. Document expected results clearly

### Updating Selectors
1. Update in Page Object files only
2. Never hardcode selectors in tests
3. Use data-test attributes when available
4. Fall back to stable CSS selectors

### Handling Flaky Tests
1. Add retry logic for unstable elements
2. Increase timeouts for slow operations
3. Use waitForSelector before interactions
4. Add screenshot on failure for debugging

---

## Best Practices Implemented

1. **Page Object Model** - All UI interactions abstracted
2. **Data-Driven Testing** - Test data separated from code
3. **Cross-Browser Testing** - Verified on multiple browsers
4. **Parallel Execution** - Tests run concurrently for speed
5. **Detailed Reporting** - Multiple report formats available
6. **Error Handling** - Graceful failure with debugging info
7. **Maintainability** - Clear structure and documentation

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Total Test Cases:** 50  
**Overall Pass Rate:** 90%