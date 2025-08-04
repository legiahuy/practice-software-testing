import { test, expect } from "@playwright/test";
import { join } from "path";
import { HomePage } from "../page-objects/HomePage";
import { CartPage } from "../page-objects/CartPage";
import { CheckoutSignInPage } from "../page-objects/CheckoutSignInPage";
import { CheckoutAddressPage } from "../page-objects/CheckoutAddressPage";
import { CheckoutPaymentPage } from "../page-objects/CheckoutPaymentPage";
import { TestDataLoader } from "../utils/TestDataLoader";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Interface for checkout test data
interface CheckoutTestData {
  test_id: string;
  title: string;
  precondition: string;
  test_step: string;
  product_ids: string;
  quantity_update: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  payment_method: string;
  account_name: string;
  account_number: string;
  expected_result: string;
  should_pass: string;
}

// Main test suite
test.describe("Multi-Step Checkout Flow - Data Driven Tests", () => {
  // Load test data
  const testData = TestDataLoader.loadCheckoutTestData();
  const testCasesToRun = TestDataLoader.getTestCasesToRun();
  const dataToTest = TestDataLoader.filterCheckoutTestData(
    testData,
    testCasesToRun
  );

  test.beforeAll(() => {
    if (testCasesToRun.length > 0) {
      console.log(`Running selected test cases: ${testCasesToRun.join(", ")}`);
    } else {
      console.log("Running all checkout test cases");
    }
  });

  dataToTest.forEach((data) => {
    test(`${data.test_id}: ${data.title}`, async ({ page }) => {
      // Initialize page objects
      const homePage = new HomePage(page);
      const cartPage = new CartPage(page);
      const signInPage = new CheckoutSignInPage(page);
      const addressPage = new CheckoutAddressPage(page);
      const paymentPage = new CheckoutPaymentPage(page);

      // Setup: Add products to cart if needed
      if (data.product_ids) {
        await homePage.navigate();
        const productIds = data.product_ids.split(",").map((id) => id.trim());

        if (productIds.length > 0 && productIds[0] !== "") {
          await homePage.addMultipleProductsToCart(productIds);
        }
      }

      // Execute test based on test step
      switch (data.test_step) {
        case "cart":
          await executeCartTest(data, cartPage, homePage, page);
          break;

        case "signin":
          await executeSignInTest(data, cartPage, signInPage, page);
          break;

        case "address":
          await executeAddressTest(data, cartPage, signInPage, addressPage, page);
          break;

        case "payment":
          await executePaymentTest(
            data,
            cartPage,
            signInPage,
            addressPage,
            paymentPage
          );
          break;

        case "complete":
          await executeCompleteCheckoutTest(
            data,
            cartPage,
            signInPage,
            addressPage,
            paymentPage
          );
          break;

        default:
          throw new Error(`Unknown test step: ${data.test_step}`);
      }

      // Take screenshot for evidence
      const screenshotPath = join(__dirname, `../../screenshots/checkout/${data.test_id}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      console.log(`Screenshot saved to: ${screenshotPath}`);
    });
  });

  // Cart test execution
  async function executeCartTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    homePage: HomePage,
    page: any
  ) {
    await cartPage.navigate();

    // Handle different cart test scenarios
    if (data.quantity_update === "check_empty") {
      // Test empty cart - main requirement is that proceed button is not available
      console.log("Testing empty cart state...");
      
      // Check if proceed button exists and is visible
      const proceedButton = page.locator('[data-test="proceed-1"]');
      const isProceedButtonVisible = await proceedButton.isVisible();
      console.log(`Proceed button visible: ${isProceedButtonVisible}`);
      
      if (data.should_pass === "true") {
        // Main test: Proceed button should NOT be visible when cart is empty
        expect(isProceedButtonVisible).toBe(false);
        console.log("PASS: Proceed to checkout button is correctly hidden/disabled for empty cart");
      }
    } else if (data.quantity_update === "delete_first") {
      // Delete first item when multiple exist
      const productNameMap: Record<string, string> = {
        "1": "Combination Pliers",
        "6": "Claw Hammer with Shock Reduction Grip", 
        "10": "Adjustable Wrench"
      };
      
      const firstProductId = data.product_ids.split(',')[0].trim();
      const productToDelete = productNameMap[firstProductId] || "Unknown Product";
      
      console.log(`Testing delete functionality for: ${productToDelete}`);
      
      // Check that product exists before deletion
      const productRowBefore = page.locator(`tr:has-text("${productToDelete}")`);
      const existsBefore = await productRowBefore.isVisible();
      console.log(`Product "${productToDelete}" exists before delete: ${existsBefore}`);
      expect(existsBefore).toBe(true);
      
      // Get initial count
      const initialCount = await cartPage.getCartItemCount();
      console.log(`Items in cart before delete: ${initialCount}`);
      
      // Click delete button for the specific product
      await page.getByRole('row', { name: productToDelete }).locator('a').click();
      
      // Wait a bit for deletion to process
      await page.waitForTimeout(500);
      
      // Check that product no longer exists
      const productRowAfter = page.locator(`tr:has-text("${productToDelete}")`);
      const existsAfter = await productRowAfter.isVisible();
      console.log(`Product "${productToDelete}" exists after delete: ${existsAfter}`);
      
      if (existsAfter) {
        console.log(`BUG DETECTED in ${data.test_id}: Product was not removed from cart!`);
      }
      
      // Verify product was actually removed
      expect(existsAfter).toBe(false);
      
      // Verify count decreased
      const newCount = await cartPage.getCartItemCount();
      console.log(`Items in cart after delete: ${newCount}`);
      expect(newCount).toBe(initialCount - 1);
      
      // Verify we can still proceed (cart not empty)
      expect(await cartPage.isProceedButtonEnabled()).toBe(true);
    } else if (data.quantity_update === "delete_all") {
      // Delete all items (only one item in cart)
      const productNameMap: Record<string, string> = {
        "1": "Combination Pliers",
        "6": "Claw Hammer with Shock Reduction Grip", 
        "10": "Adjustable Wrench"
      };
      
      const firstProductId = data.product_ids.split(',')[0].trim();
      const productToDelete = productNameMap[firstProductId] || "Unknown Product";
      
      console.log(`Testing delete last item: ${productToDelete}`);
      
      // Check that product exists before deletion
      const productRowBefore = page.locator(`tr:has-text("${productToDelete}")`);
      const existsBefore = await productRowBefore.isVisible();
      console.log(`Product "${productToDelete}" exists before delete: ${existsBefore}`);
      expect(existsBefore).toBe(true);
      
      // Click delete button
      await page.getByRole('row', { name: productToDelete }).locator('a').click();
      
      // Wait a bit for deletion to process
      await page.waitForTimeout(500);
      
      // Check that product no longer exists
      const productRowAfter = page.locator(`tr:has-text("${productToDelete}")`);
      const existsAfter = await productRowAfter.isVisible();
      console.log(`Product "${productToDelete}" exists after delete: ${existsAfter}`);
      
      if (existsAfter) {
        console.log(`BUG DETECTED in ${data.test_id}: Last product was not removed from cart!`);
      }
      
      // Verify product was actually removed
      expect(existsAfter).toBe(false);
      
      // Verify cart is now empty
      const isEmpty = await cartPage.isCartEmpty();
      console.log(`Cart is empty: ${isEmpty}`);
      expect(isEmpty).toBe(true);
      
      // Verify proceed button is disabled
      const isProceedEnabled = await cartPage.isProceedButtonEnabled();
      console.log(`Proceed button enabled: ${isProceedEnabled}`);
      expect(isProceedEnabled).toBe(false);
    } else if (data.quantity_update !== undefined && data.quantity_update !== "check_empty" && data.quantity_update !== "delete_first" && data.quantity_update !== "delete_all") {
      // Update quantity (including empty string)
      // Map product IDs to product names (based on the actual products in the store)
      const productNameMap: Record<string, string> = {
        "1": "Combination Pliers",
        "6": "Claw Hammer with Shock Reduction Grip", 
        "10": "Adjustable Wrench"
      };
      
      const productId = data.product_ids.split(',')[0].trim();
      const productName = productNameMap[productId] || "Unknown Product";
      
      console.log(`Testing product: ${productName} (ID: ${productId})`);

      // Get product price before update
      const priceText = await cartPage.getProductPrice(productName);
      const price = parseFloat(priceText.replace("$", ""));

      // Update quantity
      await cartPage.updateQuantity(productName, data.quantity_update);

      if (data.should_pass === "true") {
        const newQuantity = await cartPage.getProductQuantity(productName);
        expect(newQuantity).toBe(data.quantity_update);
        expect(await cartPage.hasQuantityError()).toBe(false);

        // Verify individual product total is updated correctly
        const productTotal = await cartPage.getProductTotal(productName);
        const expectedTotal = price * parseInt(data.quantity_update);
        const actualTotal = parseFloat(
          productTotal.replace("$", "").replace(",", "")
        );

        // This is a known bug - individual product total shows $0.00 instead of calculated value
        if (data.test_id === "TC_CART_001") {
          console.log(
            `BUG DETECTED: Expected product total $${expectedTotal.toFixed(
              2
            )}, but got $${actualTotal.toFixed(2)}`
          );
          // Test will fail to document the bug
        }

        expect(actualTotal).toBe(expectedTotal);
      } else {
        // For invalid quantity tests
        if (data.quantity_update === "") {
          // TC_CART_003: Empty quantity should prevent checkout
          console.log("Testing empty quantity - should prevent checkout");
          
          // Directly fill empty value like codegen does
          await page.locator('[data-test="product-quantity"]').click();
          await page.locator('[data-test="product-quantity"]').fill('');
          
          // Verify quantity is actually empty
          const currentQuantity = await page.locator('[data-test="product-quantity"]').inputValue();
          console.log(`Current quantity after clearing: "${currentQuantity}"`);
          
          // Record URL before proceeding
          const urlBeforeProceed = page.url();
          console.log(`URL before proceed: ${urlBeforeProceed}`);
          
          // Try to proceed to checkout
          console.log("Attempting to proceed to checkout with empty quantity...");
          
          // Click proceed and wait for either:
          // 1. Customer login page (bug - should not allow)
          // 2. Error message (expected)
          // 3. Stay on same page (expected)
          await page.locator('[data-test="proceed-1"]').click();
          
          // Wait for one of these conditions
          try {
            // Check if we see login page elements (indicates we moved to next step - BUG)
            const loginPageAppeared = await page.waitForSelector('text="Customer login"', { 
              timeout: 1000,
              state: 'visible' 
            }).then(() => true).catch(() => false);
            
            if (loginPageAppeared) {
              console.log(`BUG DETECTED in ${data.test_id}: System allowed checkout with empty quantity!`);
              console.log("Navigated to login page - should have been blocked");
              
              // Also check URL for confirmation
              const urlAfterProceed = page.url();
              console.log(`URL changed to: ${urlAfterProceed}`);
              
              // Test fails - we shouldn't be able to proceed
              expect(loginPageAppeared).toBe(false);
            } else {
              // Good - we stayed on cart page
              console.log("Good: System blocked checkout with empty quantity");
              
              // Check if there's an error message
              const hasError = await cartPage.hasQuantityError();
              console.log(`Quantity error displayed: ${hasError}`);
              
              // We expect to stay on cart page
              const stillOnCart = page.url().includes('checkout') || page.url().includes('cart');
              expect(stillOnCart).toBe(true);
            }
          } catch (error) {
            console.log("Unexpected error during test:", error);
            throw error;
          }
        } else {
          // Other invalid quantity tests (zero, negative, etc.)
          console.log(`Testing invalid quantity: "${data.quantity_update}" - should prevent checkout`);
          
          // Record URL before proceeding
          const urlBeforeProceed = page.url();
          
          // Try to proceed to checkout
          console.log("Attempting to proceed to checkout with invalid quantity...");
          await page.locator('[data-test="proceed-1"]').click();
          
          // Check if we see login page (indicates we moved to next step - BUG)
          const loginPageAppeared = await page.waitForSelector('text="Customer login"', { 
            timeout: 1000,
            state: 'visible' 
          }).then(() => true).catch(() => false);
          
          if (loginPageAppeared) {
            console.log(`BUG DETECTED in ${data.test_id}: System allowed checkout with invalid quantity: ${data.quantity_update}`);
            console.log("Navigated to login page - should have been blocked");
            
            // Test fails - we shouldn't be able to proceed
            expect(loginPageAppeared).toBe(false);
          } else {
            // Good - we stayed on cart page
            console.log(`Good: System blocked checkout with invalid quantity: ${data.quantity_update}`);
            
            // We expect to stay on cart page
            const stillOnCart = page.url().includes('checkout') || page.url().includes('cart');
            expect(stillOnCart).toBe(true);
          }
        }
      }
    }
  }

  // Sign-in test execution
  async function executeSignInTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage,
    page: any
  ) {
    await cartPage.navigate();
    await cartPage.proceedToCheckout();

    // Fill sign-in form
    if (data.email !== undefined) {
      await signInPage.fillEmail(data.email);
    }
    if (data.password !== undefined) {
      await signInPage.fillPassword(data.password);
    }

    await signInPage.clickLogin();

    // Verify results
    if (data.should_pass === "true") {
      // Should be able to proceed
      expect(await signInPage.isProceedButtonVisible()).toBe(true);
      expect(await signInPage.hasLoginError()).toBe(false);
    } else {
      // Wait for error to appear
      await page.waitForTimeout(1000);
      
      // Should see errors
      const hasEmailError = await signInPage.hasEmailError();
      const hasPasswordError = await signInPage.hasPasswordError();
      const hasLoginError = await signInPage.hasLoginError();
      
      // Debug logging
      console.log(`Test ${data.test_id} - Email error: ${hasEmailError}, Password error: ${hasPasswordError}, Login error: ${hasLoginError}`);
      
      expect(hasEmailError || hasPasswordError || hasLoginError).toBe(true);
    }
  }

  // Address test execution
  async function executeAddressTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage,
    addressPage: CheckoutAddressPage,
    page: any
  ) {
    // Navigate through previous steps
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    await signInPage.signIn(data.email, data.password);
    await signInPage.proceedToAddress();
    
    // Wait for address form to be fully loaded
    await page.waitForSelector('[data-test="address"]', { state: 'visible' });
    await page.waitForTimeout(1000); // Give form time to populate any default values

    // Fill address form
    await addressPage.fillAddressForm({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postcode: data.postcode,
    });

    // Verify results
    if (data.should_pass === "true") {
      // Should be able to proceed to payment step
      await addressPage.proceedToPayment();
      // Should proceed without errors
      expect(await addressPage.hasAnyError()).toBe(false);
    } else {
      // For invalid data, the proceed button should be disabled
      const proceedButton = page.locator('[data-test="proceed-3"]');
      const isDisabled = await proceedButton.isDisabled();
      console.log(`Test ${data.test_id} - Proceed button disabled: ${isDisabled}`);
      
      // Check for validation errors
      const hasErrors = await addressPage.hasAnyError();
      console.log(`Test ${data.test_id} - Has errors: ${hasErrors}`);
      
      // Debug: check what alerts are visible
      const allAlerts = await page.locator('.alert').allTextContents();
      console.log(`Test ${data.test_id} - Alerts visible:`, allAlerts);
      
      // Special handling for TC_ADDRESS_004 - minimum length validation
      if (data.test_id === 'TC_ADDRESS_004') {
        // Check for empty error box (alert with no text)
        const emptyAlerts = await page.locator('.alert').filter({ hasText: /^[\s]*$/ }).count();
        console.log(`Test ${data.test_id} - Empty error boxes found: ${emptyAlerts}`);
        
        // Check if there are any alerts with specific error messages
        const alertsWithText = await page.locator('.alert').filter({ hasText: /.+/ }).count();
        console.log(`Test ${data.test_id} - Alerts with text found: ${alertsWithText}`);
        
        // BUG: The system shows an empty error box instead of specific validation errors
        console.log(`BUG DETECTED in ${data.test_id}: System displays empty error box instead of specific validation error message for minimum length`);
        
        // The expected result says "displays specific validation errors"
        // But we're getting empty error boxes, so this should FAIL
        expect(alertsWithText).toBeGreaterThan(0); // This will fail, documenting the bug
      } else {
        // The button should be disabled when there are validation errors
        expect(isDisabled).toBe(true);
      }
    }
  }

  // Payment test execution
  async function executePaymentTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage,
    addressPage: CheckoutAddressPage,
    paymentPage: CheckoutPaymentPage
  ) {
    // Navigate through all previous steps
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    await signInPage.signIn(data.email, data.password);
    await signInPage.proceedToAddress();
    await addressPage.fillAddressForm({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postcode: data.postcode,
    });
    await addressPage.proceedToPayment();

    // Select payment method
    const paymentMethodMap: Record<string, () => Promise<void>> = {
      "Bank Transfer": () => paymentPage.selectBankTransfer(),
      "Cash on Delivery": () => paymentPage.selectCashOnDelivery(),
      "Credit Card": () => paymentPage.selectCreditCard(),
      "Buy Now Pay Later": () => paymentPage.selectBuyNowPayLater(),
      "Gift Card": () => paymentPage.selectGiftCard(),
      Error: () => paymentPage.selectErrorPayment(),
    };

    if (data.payment_method && paymentMethodMap[data.payment_method]) {
      await paymentMethodMap[data.payment_method]();
    }

    // Fill payment details if required
    if (data.payment_method === "Bank Transfer") {
      if (data.account_name) {
        await paymentPage.fillAccountName(data.account_name);
      }
      if (data.account_number) {
        await paymentPage.fillAccountNumber(data.account_number);
      }
    }

    // Complete checkout
    await paymentPage.completeCheckout();

    // Verify results
    if (data.should_pass === "true") {
      expect(await paymentPage.isPaymentSuccessful()).toBe(true);
    } else {
      const hasPaymentError = await paymentPage.hasPaymentMethodError();
      const hasAccountNameError = await paymentPage.hasAccountNameError();
      const hasAccountNumberError = await paymentPage.hasAccountNumberError();

      expect(
        hasPaymentError || hasAccountNameError || hasAccountNumberError
      ).toBe(true);
    }
  }

  // Complete checkout flow test
  async function executeCompleteCheckoutTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage,
    addressPage: CheckoutAddressPage,
    paymentPage: CheckoutPaymentPage
  ) {
    // Execute full checkout flow
    await cartPage.navigate();
    await cartPage.proceedToCheckout();

    // Sign in
    await signInPage.signIn(data.email, data.password);
    await signInPage.proceedToAddress();

    // Fill address
    await addressPage.fillAddressForm({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postcode: data.postcode,
    });
    await addressPage.proceedToPayment();

    // Select payment and complete
    await paymentPage.selectCashOnDelivery();
    await paymentPage.completeCheckout();

    // Verify successful completion
    expect(await paymentPage.isPaymentSuccessful()).toBe(true);
  }
});
