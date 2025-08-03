# Bug Report - Practice Software Testing

## Bugs Identified Through Automation Testing

### 1. Contact Form - Invalid Subject Accepted (TC_CONTACT_018)

**Severity**: Medium  
**Test Case**: TC_CONTACT_018  
**Component**: Contact Form - Subject Validation  

**Description**: The contact form accepts "Error 101: Subject not found" as a valid subject and allows form submission.

**Expected Behavior**: Form should reject submission with invalid/error subject values.

**Actual Behavior**: Form submits successfully with error subject selected.

**Impact**: Could lead to unhandled contact requests or data integrity issues in the backend.

---

### 2. Cart - Individual Product Total Not Updating (TC_CART_001)

**Severity**: High  
**Test Case**: TC_CART_001  
**Component**: Shopping Cart - Price Calculation  

**Description**: When quantity is updated in the cart, the individual product total (quantity × price) remains at $0.00 instead of updating to reflect the new quantity.

**Steps to Reproduce**:
1. Add a product to cart
2. Navigate to cart page
3. Change quantity from 1 to 5
4. Observe the product row total

**Expected Behavior**: 
- Product price: $14.15
- Quantity: 5
- Product total should show: $70.75

**Actual Behavior**: 
- Product total remains at: $0.00
- Grand total updates correctly
- Only the individual product row total fails to update

**Impact**: Users cannot see the total price for individual items with multiple quantities, leading to confusion about pricing.

**Technical Details**:
- The grand total (sum of all products) calculates correctly
- Only the individual product row total field remains at 0
- Suggests the issue is with the UI update logic for the product total cell

---

### 3. Cart - Empty Quantity Allows Checkout (TC_CART_003)

**Severity**: High  
**Test Case**: TC_CART_003  
**Component**: Shopping Cart - Quantity Validation  

**Description**: When the quantity field is cleared (empty) in the cart, the system still allows users to proceed to checkout.

**Steps to Reproduce**:
1. Add a product to cart
2. Navigate to cart page
3. Clear the quantity field (make it empty)
4. Click "Proceed to Checkout"

**Expected Behavior**: 
- System should prevent checkout
- Display validation error about invalid/empty quantity
- Keep user on cart page

**Actual Behavior**: 
- System allows proceeding to checkout with empty quantity
- No validation error displayed
- User can continue through checkout process

**Impact**: Could lead to orders with undefined quantities, causing processing errors and customer confusion.

---

## Test Execution Summary

| Feature | Total Tests | Passed | Failed | Pass Rate |
|---------|------------|--------|--------|-----------|
| Contact Form | 22 | 21 | 1 | 95.5% |
| Checkout Flow | 27 | 25 | 2 | 92.6% |
| **Overall** | **49** | **46** | **3** | **93.9%** |

## Recommendations

1. **Priority 1**: Fix the cart individual product total calculation as it directly impacts user experience and trust in pricing
2. **Priority 2**: Add server-side validation for contact form subjects to prevent invalid submissions
3. Consider adding unit tests for price calculation logic
4. Implement E2E tests as part of CI/CD pipeline to catch regressions early