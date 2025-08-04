import { Page } from "@playwright/test";

export class CheckoutAddressPage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    addressInput: '[data-test="address"]',
    cityInput: '[data-test="city"]',
    stateInput: '[data-test="state"]',
    countryInput: '[data-test="country"]',
    postcodeInput: '[data-test="postcode"]',
    proceedButton: '[data-test="proceed-3"]',
    addressError: '.alert:has-text("Address is required")',
    cityError: '.alert:has-text("City is required")',
    stateError: '.alert:has-text("State is required")',
    countryError: '.alert:has-text("Country is required")',
    postcodeError: '.alert:has-text("Postcode is required")',
  };

  // Fill address form
  async fillAddress(address: string) {
    const addressInput = this.page.locator(this.selectors.addressInput);
    await addressInput.click();
    await addressInput.press('ControlOrMeta+a');
    await addressInput.fill(address);
  }

  async fillCity(city: string) {
    const cityInput = this.page.locator(this.selectors.cityInput);
    await cityInput.click();
    await cityInput.press('ControlOrMeta+a');
    await cityInput.fill(city);
  }

  async fillState(state: string) {
    const stateInput = this.page.locator(this.selectors.stateInput);
    await stateInput.click();
    await stateInput.press('ControlOrMeta+a');
    await stateInput.fill(state);
  }

  async fillCountry(country: string) {
    const countryInput = this.page.locator(this.selectors.countryInput);
    await countryInput.click();
    await countryInput.press('ControlOrMeta+a');
    await countryInput.fill(country);
  }

  async fillPostcode(postcode: string) {
    const postcodeInput = this.page.locator(this.selectors.postcodeInput);
    await postcodeInput.dblclick();
    await postcodeInput.press('ControlOrMeta+a');
    await postcodeInput.fill(postcode);
  }

  async fillAddressForm(data: {
    address: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  }) {
    // Always fill fields, even with empty values to properly test validation
    if (data.address !== undefined) await this.fillAddress(data.address);
    if (data.city !== undefined) await this.fillCity(data.city);
    if (data.state !== undefined) await this.fillState(data.state);
    if (data.country !== undefined) await this.fillCountry(data.country);
    if (data.postcode !== undefined) await this.fillPostcode(data.postcode);
  }

  async proceedToPayment() {
    await this.page.click(this.selectors.proceedButton);
    await this.page.waitForLoadState("networkidle");
  }

  // Validation methods
  async hasAddressError(): Promise<boolean> {
    return await this.page.locator(this.selectors.addressError).isVisible();
  }

  async hasCityError(): Promise<boolean> {
    return await this.page.locator(this.selectors.cityError).isVisible();
  }

  async hasStateError(): Promise<boolean> {
    return await this.page.locator(this.selectors.stateError).isVisible();
  }

  async hasCountryError(): Promise<boolean> {
    return await this.page.locator(this.selectors.countryError).isVisible();
  }

  async hasPostcodeError(): Promise<boolean> {
    return await this.page.locator(this.selectors.postcodeError).isVisible();
  }

  async hasAnyError(): Promise<boolean> {
    // Check for any alert (including empty ones for minimum length validation)
    const allAlerts = await this.page.locator('.alert').count();
    
    // Also check for alerts with specific error text
    const alertsWithErrors = this.page.locator('.alert').filter({ 
      hasText: /required|invalid/i 
    });
    
    const errorAlertCount = await alertsWithErrors.count();
    
    // Return true if there are any alerts (empty or with text)
    return allAlerts > 0 || errorAlertCount > 0;
  }

  async getFieldError(field: string): Promise<string | null> {
    const errorSelectors: Record<string, string> = {
      address: this.selectors.addressError,
      city: this.selectors.cityError,
      state: this.selectors.stateError,
      country: this.selectors.countryError,
      postcode: this.selectors.postcodeError,
    };

    const selector = errorSelectors[field];
    if (!selector) return null;

    try {
      const error = this.page.locator(selector);
      if (await error.isVisible()) {
        return await error.textContent();
      }
    } catch {
      return null;
    }
    return null;
  }
}