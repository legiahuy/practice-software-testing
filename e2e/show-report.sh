#!/bin/bash

# Script to show the Playwright HTML report

# Change to e2e directory
cd "$(dirname "$0")"

# Check if report exists
if [ -f "playwright-report/index.html" ]; then
    echo "Opening Playwright HTML report..."
    npx playwright show-report playwright-report
else
    echo "No report found. Run tests first with:"
    echo "  npm test"
    echo "or"
    echo "  CHECKOUT_TEST_CASES=TC_CART_001 npx playwright test src/tests/checkout-flow.spec.ts"
fi