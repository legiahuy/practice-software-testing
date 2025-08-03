# Multi-Step Checkout Automation Testing

## Overview

This document describes the automation testing implementation for the multi-step checkout process in the Practice Software Testing application. The checkout flow consists of four main steps: Cart, Sign In, Address, and Payment.

## Test Architecture

### Page Object Model Structure

```
src/
├── page-objects/
│   ├── HomePage.ts          # Product selection and cart actions
│   ├── CartPage.ts          # Cart management and validation
│   ├── CheckoutSignInPage.ts # Authentication during checkout
│   ├── CheckoutAddressPage.ts # Shipping address form
│   └── CheckoutPaymentPage.ts # Payment method selection
├── tests/
│   └── checkout-flow.spec.ts # Main checkout test suite
└── test-data/
    └── checkout_test_data.csv # 27 test cases
```

## Test Cases

### Cart Tests (TC_CART_001 - TC_CART_008)
- Quantity updates (valid, minimum, empty, zero, negative)
- Item removal (single, multiple, last item)
- Empty cart validation

### Sign In Tests (TC_SIGNIN_001 - TC_SIGNIN_005)
- Valid credentials
- Empty email/password
- Invalid email format
- Incorrect credentials

### Address Tests (TC_ADDRESS_001 - TC_ADDRESS_004)
- Valid address submission
- Required field validations
- Format validations (postcode)

### Payment Tests (TC_PAYMENT_001 - TC_PAYMENT_010)
- Different payment methods (Bank Transfer, COD, Credit Card, etc.)
- Payment validation errors
- Required field validations
- Complete checkout flow

## Running Tests

### All Checkout Tests
```bash
npm run test:checkout
```

### By Test Step
```bash
# Cart tests only
npm run test:checkout:cart

# Sign-in tests only
npm run test:checkout:signin

# Address tests only
npm run test:checkout:address

# Payment tests only
npm run test:checkout:payment
```

### Single Test Case
```bash
# Run specific test
CHECKOUT_TEST_CASES="TC_CART_001" npm run test:checkout

# Or using the script
TEST_ID=TC_PAYMENT_001 npm run test:checkout:single
```

### Multiple Test Cases
```bash
CHECKOUT_TEST_CASES="TC_CART_001,TC_CART_005,TC_PAYMENT_001" npm run test:checkout
```

## Test Data Structure

The CSV file contains the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| test_id | Unique identifier | TC_CART_001 |
| title | Test description | Verify quantity update with valid value |
| precondition | Setup requirements | User has an item in cart |
| test_step | Which step to test | cart, signin, address, payment, complete |
| product_ids | Products to add | "1,6,10" |
| quantity_update | Cart quantity action | 5, "delete_first", "check_empty" |
| email | Login email | customer@practicesoftwaretesting.com |
| password | Login password | welcome01 |
| address | Street address | Test street 99 |
| city | City name | Thu Duc |
| state | State/Province | HCMC |
| country | Country name | Vietnam |
| postcode | Postal code | 12345 |
| payment_method | Payment type | Bank Transfer, Cash on Delivery |
| account_name | Bank account name | John Doe |
| account_number | Bank account number | 1234567890 |
| expected_result | Expected behavior | Payment is successful |
| should_pass | Test outcome | true/false |

## Key Features

### 1. Multi-Step Navigation
The framework handles progression through checkout steps automatically:
```typescript
// Navigate through all steps
await cartPage.proceedToCheckout();
await signInPage.signIn(email, password);
await signInPage.proceedToAddress();
await addressPage.fillAddressForm(data);
await addressPage.proceedToPayment();
await paymentPage.selectPaymentMethod();
await paymentPage.completeCheckout();
```

### 2. Dynamic Test Execution
Tests execute different steps based on `test_step` field:
- `cart`: Tests cart functionality only
- `signin`: Tests up to sign-in step
- `address`: Tests up to address step
- `payment`: Tests up to payment step
- `complete`: Executes full checkout flow

### 3. Flexible Product Setup
Products are added dynamically before each test:
```typescript
if (data.product_ids) {
  const productIds = data.product_ids.split(',');
  await homePage.addMultipleProductsToCart(productIds);
}
```

### 4. Comprehensive Validation
Each page object includes validation methods:
- Error detection
- Field-specific error messages
- Success confirmation
- State verification

## Payment Methods

The framework supports all payment methods:

1. **Bank Transfer** - Requires account name and number
2. **Cash on Delivery** - No additional fields
3. **Credit Card** - No additional fields in demo
4. **Buy Now Pay Later** - No additional fields
5. **Gift Card** - No additional fields
6. **Error Payment** - For testing error scenarios

## Best Practices

1. **Test Independence**: Each test sets up its own data
2. **Clear Assertions**: Explicit validation of expected vs actual
3. **Screenshot Evidence**: Captured after each test
4. **Error Handling**: Graceful failure with descriptive messages
5. **Reusable Components**: Page objects can be used across tests

## Debugging

### Visual Debugging
```bash
# Run with UI mode
npm run test:ui

# Run headed (see browser)
npm run test:checkout -- --headed

# Debug mode
npm run test:checkout -- --debug
```

### Test Reports
- HTML reports in `playwright-report/`
- Screenshots in `screenshots/`
- Custom reporter output in console

## Known Issues

### Bug Found: TC_CART_001 - Individual Product Total Not Updating
When updating quantity in the cart, the individual product total (quantity × price) remains at $0.00 instead of calculating correctly. The grand total updates properly, but the line item total does not reflect the quantity change.

## Known Limitations

1. Stock validation not implemented
2. Coupon/discount codes not tested
3. Guest checkout not covered
4. Multiple shipping addresses not tested

## Future Enhancements

1. Add inventory/stock validation tests
2. Test promotional codes and discounts
3. Add performance testing for checkout
4. Implement API-level validation
5. Add accessibility testing for checkout forms