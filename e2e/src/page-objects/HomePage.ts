import { Page } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  // Selectors
  private selectors = {
    productItem: (id: string) => `[data-test="product-${id}"]`,
    addToCart: '[data-test="add-to-cart"]',
    navCart: '[data-test="nav-cart"]',
    searchInput: '[data-test="search-query"]',
    searchButton: '[data-test="search-submit"]',
  };

  // Navigation
  async navigate() {
    await this.page.goto("/#/");
    await this.page.waitForLoadState("networkidle");
  }

  // Product actions
  async selectProduct(productId: string) {
    await this.page.locator(this.selectors.productItem(productId)).click();
    await this.page.waitForLoadState("networkidle");
  }

  async addToCart() {
    await this.page.locator(this.selectors.addToCart).click();
    // Wait for cart update
    await this.page.waitForTimeout(500);
  }

  async addProductToCart(productId: string) {
    await this.selectProduct(productId);
    await this.addToCart();
  }

  async navigateToCart() {
    await this.page.locator(this.selectors.navCart).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Helper to add multiple products
  async addMultipleProductsToCart(productIds: string[]) {
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      
      // Navigate to home page if not the first product
      if (i > 0) {
        await this.navigate();
      }
      
      await this.addProductToCart(productId);
      // Small delay between products
      await this.page.waitForTimeout(300);
    }
  }
}