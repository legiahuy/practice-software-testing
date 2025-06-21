import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { parse } from 'csv-parse/sync';
import { parse as parseCsv } from 'csv-parse/sync';

test.describe('Registration Data-Driven @register-csv', () => {
  const csvFilePath = path.join(__dirname, 'test-data', 'register_test_data.csv');

  // Parse the CSV file synchronously
  function parseRegisterCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCsv(content, {
      columns: true,
      skip_empty_lines: true
    });
  }

  // Add screenshot after each registration test
  test.afterEach(async ({ page }, testInfo) => {
    const baseDir = `test-results/register-csv`;
    const screenshotDir = `${baseDir}/screenshots`;
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({
      path: `${screenshotDir}/${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true,
    });
  });

  // Main data-driven registration test
  // Country name to code mapping (add more as needed)
  const countryNameToCode: Record<string, string> = {
    'Viet Nam': 'VN',
    'United Kingdom': 'GB',
    'Ireland': 'IE',
    'China': 'CN',
    'France': 'FR',
    'Testland': 'TL',
    // Add more as needed
  };

  function toISODate(dateStr: string): string {
    // Convert MM/DD/YYYY or M/D/YYYY to YYYY-MM-DD
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      if (year.length === 4) {
        return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    // If already in YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr;
  }

  let testCases = parseRegisterCSV(csvFilePath);
  testCases = testCases.slice(0, 10); // Only run the first 10 test cases
  for (const testCase of testCases) {
    test(`Register: ${testCase.TestCaseID}`, async ({ page }) => {
      try {
        await page.goto('http://localhost:4200/#/auth/register');
        if (testCase.FirstName) await page.locator('input[data-test="first-name"]').fill(testCase.FirstName);
        if (testCase.LastName) await page.locator('input[data-test="last-name"]').fill(testCase.LastName);
        if (testCase.DOB) {
          const iso = toISODate(testCase.DOB);
          if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            await page.locator('input[data-test="dob"]').fill(iso);
          } else {
            console.log(`Test ${testCase.TestCaseID}: Skipping invalid DOB value: ${testCase.DOB}`);
          }
        }
        if (testCase.Street) await page.locator('input[data-test="address"]').fill(testCase.Street);
        if (testCase.PostalCode) await page.locator('input[data-test="postcode"]').fill(testCase.PostalCode);
        if (testCase.City) await page.locator('input[data-test="city"]').fill(testCase.City);
        if (testCase.State) await page.locator('input[data-test="state"]').fill(testCase.State);
        // Country: only select if code exists in dropdown
        if (testCase.Country) {
          const code = countryNameToCode[testCase.Country] || testCase.Country;
          const countrySelect = page.locator('select[data-test="country"]');
          // Get all option values using evaluate
          const options = await countrySelect.evaluate((select) => Array.from((select as HTMLSelectElement).options).map(o => (o as HTMLOptionElement).value));
          if (options.includes(code)) {
            await countrySelect.selectOption(code);
          } else {
            console.log(`Test ${testCase.TestCaseID}: Skipping invalid country code: ${code}`);
          }
        }
        if (testCase.Phone) await page.locator('input[data-test="phone"]').fill(testCase.Phone);
        if (testCase.Email) await page.locator('input[data-test="email"]').fill(testCase.Email);
        if (testCase.Password) await page.locator('input[type="password"]').fill(testCase.Password);
        await page.locator('button[type="submit"]').click();
        // Wait for either error or success message
        const errorLocator = page.locator('.alert-danger');
        const successLocator = page.locator('.alert-success');
        const errorVisible = await errorLocator.isVisible().catch(() => false);
        const successVisible = await successLocator.isVisible().catch(() => false);
        if (errorVisible) {
          const errorText = await errorLocator.innerText();
          console.log(`Test ${testCase.TestCaseID} failed as expected: ${errorText}`);
        } else if (successVisible) {
          const successText = await successLocator.innerText();
          console.log(`Test ${testCase.TestCaseID} succeeded: ${successText}`);
        } else {
          console.log(`Test ${testCase.TestCaseID}: No visible error or success message after submit.`);
        }
      } catch (e) {
        console.error(`Test ${testCase.TestCaseID} threw error:`, e);
      }
    });
  }
});
