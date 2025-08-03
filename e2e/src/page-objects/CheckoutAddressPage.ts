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
    addressError: '[data-test="address-error"]',
    cityError: '[data-test="city-error"]',
    stateError: '[data-test="state-error"]',
    countryError: '[data-test="country-error"]',
    postcodeError: '[data-test="postcode-error"]',
  };

  // Fill address form
  async fillAddress(address: string) {
    await this.page.fill(this.selectors.addressInput, address);
  }

  async fillCity(city: string) {
    const cityInput = this.page.locator(this.selectors.cityInput);
    await cityInput.click();
    await cityInput.press('ControlOrMeta+a');
    await cityInput.fill(city);
  }

  async fillState(state: string) {
    await this.page.fill(this.selectors.stateInput, state);
  }

  async fillCountry(country: string) {
    await this.page.fill(this.selectors.countryInput, country);
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
    if (data.address) await this.fillAddress(data.address);
    if (data.city) await this.fillCity(data.city);
    if (data.state) await this.fillState(data.state);
    if (data.country) await this.fillCountry(data.country);
    if (data.postcode) await this.fillPostcode(data.postcode);
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
    const errors = [
      this.selectors.addressError,
      this.selectors.cityError,
      this.selectors.stateError,
      this.selectors.countryError,
      this.selectors.postcodeError,
    ];

    for (const errorSelector of errors) {
      if (await this.page.locator(errorSelector).isVisible()) {
        return true;
      }
    }
    return false;
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