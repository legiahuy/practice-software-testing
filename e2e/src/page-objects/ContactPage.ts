import { Page, expect } from "@playwright/test";

export class ContactPage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    firstNameInput: '[data-test="first-name"]',
    lastNameInput: '[data-test="last-name"]',
    emailInput: '[data-test="email"]',
    subjectSelect: '[data-test="subject"]',
    messageTextarea: '[data-test="message"]',
    attachmentInput: '[data-test="attachment"]',
    submitButton: '[data-test="contact-submit"]',
    successMessage: ".alert-success",
    firstNameError: '[data-test="first-name-error"]',
    lastNameError: '[data-test="last-name-error"]',
    emailError: '[data-test="email-error"]',
    subjectError: '[data-test="subject-error"]',
    messageError: '[data-test="message-error"]',
    attachmentError: '[data-test="attachment-error"]',
    errorAlert: ".alert-danger",
  };

  // Navigation
  async navigate() {
    await this.page.goto("/#/contact");
    await this.page.waitForLoadState("networkidle");
  }

  // Login helper
  async login(
    email: string = "customer@practicesoftwaretesting.com",
    password: string = "welcome01"
  ) {
    await this.page.goto("/");

    // Check if we need to toggle navigation on mobile
    const toggleNavButton = this.page.getByRole("button", {
      name: "Toggle navigation",
    });
    if (await toggleNavButton.isVisible()) {
      await toggleNavButton.click();
      // Wait a bit for animation
      await this.page.waitForTimeout(300);
    }

    await this.page.locator('[data-test="nav-sign-in"]').click();
    await this.page.locator('[data-test="email"]').fill(email);
    await this.page.locator('[data-test="password"]').fill(password);
    await this.page.locator('[data-test="login-submit"]').click();
    await expect(this.page.locator('[data-test="page-title"]')).toBeVisible();
    await this.page.locator('[data-test="nav-contact"]').click();
  }

  // Fill form fields
  async fillFirstName(value: string) {
    if (value) {
      await this.page.fill(this.selectors.firstNameInput, value);
    }
  }

  async fillLastName(value: string) {
    if (value) {
      await this.page.fill(this.selectors.lastNameInput, value);
    }
  }

  async fillEmail(value: string) {
    if (value) {
      await this.page.fill(this.selectors.emailInput, value);
    }
  }

  async selectSubject(value: string) {
    // Only select if value is provided
    if (value !== undefined && value !== null) {
      // For empty string, we need to select the option with empty value
      if (value === "") {
        // Try to select by the option text instead of value
        await this.page.selectOption(this.selectors.subjectSelect, { 
          label: "Error 202: Translation error" 
        });
      } else {
        // Normal selection for other values
        await this.page.selectOption(this.selectors.subjectSelect, value);
      }
    }
    // If value is undefined or null, don't interact with the dropdown (TC_CONTACT_005)
  }

  async fillMessage(value: string) {
    if (value) {
      await this.page.fill(this.selectors.messageTextarea, value);
    }
  }

  async attachFile(filename: string) {
    if (filename) {
      const filePath = `/Users/bonpaul/Downloads/Github/practice-software-testing/e2e/test-files/${filename}`;
      await this.page.setInputFiles(this.selectors.attachmentInput, filePath);
    }
  }

  async submitForm() {
    await this.page.click(this.selectors.submitButton);
  }

  // Validation checks
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      const alert = this.page.getByRole("alert");
      await alert.waitFor({ state: "visible", timeout: 5000 });
      const text = await alert.textContent();
      return text?.includes("Thanks for your message!") || false;
    } catch {
      return false;
    }
  }

  async getFieldError(field: string): Promise<string | null> {
    const errorSelectors: Record<string, string> = {
      first_name: this.selectors.firstNameError,
      last_name: this.selectors.lastNameError,
      email: this.selectors.emailError,
      subject: this.selectors.subjectError,
      message: this.selectors.messageError,
      attachment: this.selectors.attachmentError,
    };

    const selector = errorSelectors[field];
    if (!selector) return null;

    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      const errorText = await this.page.textContent(selector);
      return errorText?.trim() || null;
    } catch {
      return null;
    }
  }

  async hasAnyError(): Promise<boolean> {
    const errorSelectors = [
      this.selectors.firstNameError,
      this.selectors.lastNameError,
      this.selectors.emailError,
      this.selectors.subjectError,
      this.selectors.messageError,
      this.selectors.attachmentError,
      this.selectors.errorAlert,
    ];

    for (const selector of errorSelectors) {
      if (await this.page.isVisible(selector)) {
        return true;
      }
    }
    return false;
  }

  // Helper to check if user fields are visible (for logged in/out state)
  async areUserFieldsVisible(): Promise<boolean> {
    return await this.page.isVisible(this.selectors.firstNameInput);
  }
}