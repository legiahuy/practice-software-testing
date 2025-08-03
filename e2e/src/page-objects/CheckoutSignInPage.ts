import { Page } from "@playwright/test";

export class CheckoutSignInPage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    emailInput: '[data-test="email"]',
    passwordInput: '[data-test="password"]',
    loginButton: '[data-test="login-submit"]',
    proceedButton: '[data-test="proceed-2"]',
    emailError: '[data-test="email-error"]',
    passwordError: '[data-test="password-error"]',
    loginError: '[data-test="login-error"]',
    registerLink: '[data-test="register-link"]',
  };

  // Sign in actions
  async fillEmail(email: string) {
    await this.page.fill(this.selectors.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.page.fill(this.selectors.passwordInput, password);
  }

  async clickLogin() {
    await this.page.click(this.selectors.loginButton);
    await this.page.waitForTimeout(500);
  }

  async signIn(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async proceedToAddress() {
    await this.page.click(this.selectors.proceedButton);
    await this.page.waitForLoadState("networkidle");
  }

  // Validation methods
  async hasEmailError(): Promise<boolean> {
    return await this.page.locator(this.selectors.emailError).isVisible();
  }

  async hasPasswordError(): Promise<boolean> {
    return await this.page.locator(this.selectors.passwordError).isVisible();
  }

  async hasLoginError(): Promise<boolean> {
    return await this.page.locator(this.selectors.loginError).isVisible();
  }

  async getEmailError(): Promise<string | null> {
    if (await this.hasEmailError()) {
      return await this.page.locator(this.selectors.emailError).textContent();
    }
    return null;
  }

  async getPasswordError(): Promise<string | null> {
    if (await this.hasPasswordError()) {
      return await this.page.locator(this.selectors.passwordError).textContent();
    }
    return null;
  }

  async getLoginError(): Promise<string | null> {
    if (await this.hasLoginError()) {
      return await this.page.locator(this.selectors.loginError).textContent();
    }
    return null;
  }

  async isProceedButtonVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.proceedButton).isVisible();
  }
}