#!/bin/bash

# Script to run tests with proper configuration

# Change to e2e directory
cd "$(dirname "$0")"

# Run tests with explicit config
if [ -z "$1" ]; then
    echo "Running all tests..."
    npx playwright test --config=playwright.config.ts
else
    echo "Running specific test: $1"
    CHECKOUT_TEST_CASES="$1" npx playwright test --config=playwright.config.ts src/tests/checkout-flow.spec.ts
fi