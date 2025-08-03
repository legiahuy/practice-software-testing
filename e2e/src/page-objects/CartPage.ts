import { Page, expect } from "@playwright/test";

export class CartPage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    productQuantity: '[data-test="product-quantity"]',
    productRow: (productName: string) => `tr:has-text("${productName}")`,
    deleteButton: '[data-test="product-delete"]',
    proceedButton: '[data-test="proceed-1"]',
    cartEmpty: '[data-test="cart-empty"]',
    totalPrice: '[data-test="cart-total"]',
    itemPrice: '[data-test="product-price"]',
    productTotal: '[data-test="line-price"]',
    quantityError: '[data-test="quantity-error"]',
  };

  // Navigation
  async navigate() {
    await this.page.goto("/#/checkout");
    await this.page.waitForLoadState("networkidle");
  }

  // Cart actions
  async updateQuantity(productName: string, quantity: string) {
    const row = this.page.locator(this.selectors.productRow(productName));
    const quantityInput = row.locator(this.selectors.productQuantity);

    // Clear and fill new quantity
    await quantityInput.click();
    await quantityInput.clear();
    
    if (quantity !== "") {
      await quantityInput.fill(quantity);
    }

    // Blur to trigger update
    await quantityInput.blur();
    await this.page.waitForTimeout(300);
  }

  async deleteProduct(productName: string) {
    const row = this.page.locator(this.selectors.productRow(productName));
    await row.locator(this.selectors.deleteButton).click();
    await this.page.waitForTimeout(300);
  }

  async proceedToCheckout() {
    await this.page.locator(this.selectors.proceedButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Validation methods
  async isCartEmpty(): Promise<boolean> {
    return await this.page.locator(this.selectors.cartEmpty).isVisible();
  }

  async isProceedButtonEnabled(): Promise<boolean> {
    const button = this.page.locator(this.selectors.proceedButton);
    return await button.isEnabled();
  }

  async getProductQuantity(productName: string): Promise<string> {
    const row = this.page.locator(this.selectors.productRow(productName));
    const quantityInput = row.locator(this.selectors.productQuantity);
    return await quantityInput.inputValue();
  }

  async getTotalPrice(): Promise<string> {
    const totalElement = this.page.locator(this.selectors.totalPrice);
    return (await totalElement.textContent()) || "";
  }

  async hasQuantityError(): Promise<boolean> {
    return await this.page.locator(this.selectors.quantityError).isVisible();
  }

  async getQuantityError(): Promise<string | null> {
    try {
      const error = this.page.locator(this.selectors.quantityError);
      if (await error.isVisible()) {
        return await error.textContent();
      }
    } catch {
      return null;
    }
    return null;
  }

  async getCartItemCount(): Promise<number> {
    const rows = await this.page.locator("tbody tr").count();
    return rows;
  }

  async getProductTotal(productName: string): Promise<string> {
    const row = this.page.locator(this.selectors.productRow(productName));
    const totalElement = row.locator(this.selectors.productTotal);
    return (await totalElement.textContent()) || "";
  }

  async getProductPrice(productName: string): Promise<string> {
    const row = this.page.locator(this.selectors.productRow(productName));
    const priceElement = row.locator(this.selectors.itemPrice);
    return (await priceElement.textContent()) || "";
  }
}
