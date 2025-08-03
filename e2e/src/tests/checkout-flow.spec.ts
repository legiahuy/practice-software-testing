import { test, expect } from "@playwright/test";
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
  const dataToTest = TestDataLoader.filterCheckoutTestData(testData, testCasesToRun);

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
        const productIds = data.product_ids.split(',').map(id => id.trim());
        
        if (productIds.length > 0 && productIds[0] !== "") {
          await homePage.addMultipleProductsToCart(productIds);
        }
      }

      // Execute test based on test step
      switch (data.test_step) {
        case "cart":
          await executeCartTest(data, cartPage, homePage);
          break;
        
        case "signin":
          await executeSignInTest(data, cartPage, signInPage);
          break;
        
        case "address":
          await executeAddressTest(data, cartPage, signInPage, addressPage);
          break;
        
        case "payment":
          await executePaymentTest(data, cartPage, signInPage, addressPage, paymentPage);
          break;
        
        case "complete":
          await executeCompleteCheckoutTest(data, cartPage, signInPage, addressPage, paymentPage);
          break;
        
        default:
          throw new Error(`Unknown test step: ${data.test_step}`);
      }

      // Take screenshot for evidence
      await page.screenshot({
        path: `screenshots/${data.test_id}.png`,
        fullPage: true,
      });
    });
  });

  // Cart test execution
  async function executeCartTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    homePage: HomePage
  ) {
    await cartPage.navigate();

    // Handle different cart test scenarios
    if (data.quantity_update === "check_empty") {
      // Test empty cart
      const isEmpty = await cartPage.isCartEmpty();
      const isProceedEnabled = await cartPage.isProceedButtonEnabled();
      
      if (data.should_pass === "true") {
        expect(isEmpty).toBe(true);
        expect(isProceedEnabled).toBe(false);
      }
    } else if (data.quantity_update === "delete_first") {
      // Delete first item when multiple exist
      const initialCount = await cartPage.getCartItemCount();
      await cartPage.deleteProduct("Combination Pliers");
      const newCount = await cartPage.getCartItemCount();
      
      expect(newCount).toBe(initialCount - 1);
      expect(await cartPage.isProceedButtonEnabled()).toBe(true);
    } else if (data.quantity_update === "delete_all") {
      // Delete all items
      await cartPage.deleteProduct("Combination Pliers");
      
      expect(await cartPage.isCartEmpty()).toBe(true);
      expect(await cartPage.isProceedButtonEnabled()).toBe(false);
    } else if (data.quantity_update) {
      // Update quantity
      await cartPage.updateQuantity("Combination Pliers", data.quantity_update);
      
      if (data.should_pass === "true") {
        const newQuantity = await cartPage.getProductQuantity("Combination Pliers");
        expect(newQuantity).toBe(data.quantity_update);
        expect(await cartPage.hasQuantityError()).toBe(false);
      } else {
        expect(await cartPage.hasQuantityError()).toBe(true);
      }
    }
  }

  // Sign-in test execution
  async function executeSignInTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage
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
      // Should see errors
      const hasEmailError = await signInPage.hasEmailError();
      const hasPasswordError = await signInPage.hasPasswordError();
      const hasLoginError = await signInPage.hasLoginError();
      
      expect(hasEmailError || hasPasswordError || hasLoginError).toBe(true);
    }
  }

  // Address test execution
  async function executeAddressTest(
    data: CheckoutTestData,
    cartPage: CartPage,
    signInPage: CheckoutSignInPage,
    addressPage: CheckoutAddressPage
  ) {
    // Navigate through previous steps
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    await signInPage.signIn(data.email, data.password);
    await signInPage.proceedToAddress();

    // Fill address form
    await addressPage.fillAddressForm({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postcode: data.postcode,
    });

    await addressPage.proceedToPayment();

    // Verify results
    if (data.should_pass === "true") {
      // Should proceed to payment step
      expect(await addressPage.hasAnyError()).toBe(false);
    } else {
      // Should see validation errors
      expect(await addressPage.hasAnyError()).toBe(true);
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
      "Error": () => paymentPage.selectErrorPayment(),
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
      
      expect(hasPaymentError || hasAccountNameError || hasAccountNumberError).toBe(true);
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