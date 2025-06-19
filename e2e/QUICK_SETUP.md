# Quick Setup Guide for Playwright Demo

## Prerequisites

- Node.js 16+ installed
- PHP 8.0+ installed
- Composer installed
- Git installed

## Step 1: Install Dependencies

```bash
# Navigate to the sprint5-with-bugs directory
cd sprint5-with-bugs

# Install Playwright and dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install UI dependencies
cd UI && npm install && cd ..

# Install API dependencies
cd API && composer install && cd ..
```

## Step 2: Start the Application

```bash
# Terminal 1: Start the Angular UI
npm run start:ui

# Terminal 2: Start the Laravel API
npm run start:api
```

## Step 3: Run the Demo

### Option A: Full Demo (Recommended for presentation)

```bash
# Run all tests with HTML report
npm run demo:full
```

### Option B: Smoke Tests Only

```bash
# Run only smoke tests
npm run demo:smoke
```

### Option C: Interactive Codegen Demo

```bash
# Start codegen to record a new test
npm run demo:codegen
```

## Step 4: View Results

```bash
# View HTML report
npm run show:report

# View trace (if tests were run with tracing)
npm run show:trace
```

## Demo Commands for Presentation

### 1. Show Automatic Waiting

```bash
npm run test:debug
```

### 2. Show Multi-browser Testing

```bash
npm run test:chrome
npm run test:firefox
npm run test:safari
```

### 3. Show Mobile Testing

```bash
npm run test:mobile
```

### 4. Show Parallel Execution

```bash
npm run test:parallel
```

### 5. Show Test Tagging

```bash
npm run test:smoke
npm run test:regression
```

## Troubleshooting

### Application won't start

- Check if ports 4200 and 8000 are available
- Kill any existing processes on these ports
- Make sure all dependencies are installed

### Tests fail

- Ensure both UI and API are running
- Check the trace viewer for detailed error information
- Verify the application is accessible at http://localhost:4200

### Browsers not found

```bash
npx playwright install
```

### Permission issues

```bash
# On Linux/Mac
sudo npm run install:browsers-deps
```

## Demo Flow for Seminar

1. **Introduction** (2 min)

   - Explain what Playwright is
   - Show the toolshop application

2. **Codegen Demo** (5 min)

   - Run `npm run demo:codegen`
   - Record a simple test
   - Show generated code

3. **Automatic Waiting** (3 min)

   - Run `npm run test:debug`
   - Show how Playwright waits automatically

4. **Multi-browser Testing** (3 min)

   - Run tests on different browsers
   - Show same code works everywhere

5. **Advanced Features** (5 min)

   - Show HTML reports
   - Demonstrate trace viewer
   - Show mobile testing

6. **Real-world Scenarios** (5 min)

   - Run end-to-end tests
   - Show error handling
   - Demonstrate API testing

7. **Q&A** (5 min)

## Files Created

- `playwright-demo-script.spec.ts` - Main test file with all features
- `playwright.config.ts` - Playwright configuration
- `package.json` - Dependencies and scripts
- `demo-script.md` - Detailed presentation guide
- `QUICK_SETUP.md` - This setup guide

## Next Steps

1. Customize the test selectors based on your actual application
2. Add more specific test scenarios
3. Integrate with your CI/CD pipeline
4. Create custom page objects for better maintainability

## Support

If you encounter issues:

1. Check the Playwright documentation: https://playwright.dev/
2. Review the trace files in `test-results/`
3. Check the browser console for errors
4. Verify all services are running correctly
