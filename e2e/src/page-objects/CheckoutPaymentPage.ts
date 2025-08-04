import { Page, expect } from "@playwright/test";

export class CheckoutPaymentPage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    paymentMethodSelect: '[data-test="payment-method"]',
    accountNameInput: '[data-test="account-name"]',
    accountNumberInput: '[data-test="account-number"]',
    finishButton: '[data-test="finish"]',
    paymentMethodError: '[data-test="payment-method-error"]',
    accountNameError: '[data-test="account-name-error"]',
    accountNumberError: '[data-test="account-number-error"]',
    successMessage: 'text=Payment was successful',
    orderConfirmation: '[data-test="order-confirmation"]',
  };

  // Payment method options
  private paymentMethods = {
    bankTransfer: '2: Bank Transfer',
    cashOnDelivery: '3: Cash on Delivery',
    creditCard: '4: Credit Card',
    buyNowPayLater: '5: Buy Now Pay Later',
    giftCard: '6: Gift Card',
    error: 'error',
  };

  // Select payment method
  async selectPaymentMethod(method: string) {
    await this.page.selectOption(this.selectors.paymentMethodSelect, method);
    await this.page.waitForTimeout(300);
  }

  async selectBankTransfer() {
    await this.selectPaymentMethod(this.paymentMethods.bankTransfer);
  }

  async selectCashOnDelivery() {
    await this.selectPaymentMethod(this.paymentMethods.cashOnDelivery);
  }

  async selectCreditCard() {
    await this.selectPaymentMethod(this.paymentMethods.creditCard);
  }

  async selectBuyNowPayLater() {
    await this.selectPaymentMethod(this.paymentMethods.buyNowPayLater);
  }

  async selectGiftCard() {
    await this.selectPaymentMethod(this.paymentMethods.giftCard);
  }

  async selectErrorPayment() {
    await this.selectPaymentMethod(this.paymentMethods.error);
  }

  // Fill payment details
  async fillAccountName(name: string) {
    const input = this.page.locator(this.selectors.accountNameInput);
    await input.click();
    await input.press('ControlOrMeta+a');
    await input.fill(name);
  }

  async fillAccountNumber(number: string) {
    const input = this.page.locator(this.selectors.accountNumberInput);
    await input.click();
    await input.press('ControlOrMeta+a');
    await input.fill(number);
  }

  async fillBankTransferDetails(accountName: string, accountNumber: string) {
    await this.fillAccountName(accountName);
    await this.fillAccountNumber(accountNumber);
  }

  async completeCheckout() {
    await this.page.click(this.selectors.finishButton);
    await this.page.waitForLoadState("networkidle");
  }

  // Validation methods
  async hasPaymentMethodError(): Promise<boolean> {
    // Check both specific selector and generic alerts
    const specificError = await this.page.locator(this.selectors.paymentMethodError).isVisible();
    const alertError = await this.page.locator('.alert:has-text("payment method")').isVisible();
    return specificError || alertError;
  }

  async hasAccountNameError(): Promise<boolean> {
    // Check both specific selector and generic alerts
    const specificError = await this.page.locator(this.selectors.accountNameError).isVisible();
    const alertError = await this.page.locator('.alert:has-text("account name")').isVisible();
    return specificError || alertError;
  }

  async hasAccountNumberError(): Promise<boolean> {
    // Check both specific selector and generic alerts
    const specificError = await this.page.locator(this.selectors.accountNumberError).isVisible();
    const alertError = await this.page.locator('.alert:has-text("account number")').isVisible();
    return specificError || alertError;
  }

  async isPaymentSuccessful(): Promise<boolean> {
    try {
      await expect(this.page.getByText('Payment was successful')).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasOrderConfirmation(): Promise<boolean> {
    return await this.page.locator(this.selectors.orderConfirmation).isVisible();
  }

  async getSelectedPaymentMethod(): Promise<string> {
    return await this.page.locator(this.selectors.paymentMethodSelect).inputValue();
  }

  async arePaymentFieldsVisible(): Promise<boolean> {
    const accountName = await this.page.locator(this.selectors.accountNameInput).isVisible();
    const accountNumber = await this.page.locator(this.selectors.accountNumberInput).isVisible();
    return accountName && accountNumber;
  }

  async getPaymentMethodOptions(): Promise<string[]> {
    const options = await this.page.locator(`${this.selectors.paymentMethodSelect} option`).allTextContents();
    return options;
  }
}