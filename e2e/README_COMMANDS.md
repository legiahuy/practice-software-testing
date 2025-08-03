# Test Execution Commands

## Quick Commands

### From the e2e directory:

```bash
# Run single checkout test without retries
cd e2e
CHECKOUT_TEST_CASES=TC_CART_001 npx playwright test src/tests/checkout-flow.spec.ts --project=chromium

# Run with headed browser
CHECKOUT_TEST_CASES=TC_CART_001 npx playwright test src/tests/checkout-flow.spec.ts --project=chromium --headed

# View report (make sure you're in the e2e directory)
npx playwright show-report playwright-report

# Or use npm script
npm run report
```

### From the project root:

```bash
# Run from root directory
cd e2e && CHECKOUT_TEST_CASES=TC_CART_001 npx playwright test src/tests/checkout-flow.spec.ts --project=chromium

# View report from root
cd e2e && npx playwright show-report
```

## Configuration Notes

1. **Retries are disabled** in playwright.config.ts to prevent tests running multiple times
2. **Reports are generated in** `e2e/playwright-report/` directory
3. **Test results are stored in** `e2e/test-results/` directory
4. **Screenshots are saved in** `e2e/screenshots/checkout/` directory

## Known Issues

- TC_CART_001 will fail due to bug: Individual product total shows $0.00 instead of calculated value
- TC_CONTACT_018 will fail due to bug: Invalid subject is accepted

## Environment Variables

Set in `.env` file or export before running:

```bash
export CHECKOUT_TEST_CASES=TC_CART_001
export HEADLESS=false  # To see browser
```