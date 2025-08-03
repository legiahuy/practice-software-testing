import { test, expect } from "@playwright/test";
import { ContactPage } from "../page-objects/ContactPage";
import { TestDataLoader } from "../utils/TestDataLoader";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Main test suite
test.describe("Contact Form - Data Driven Tests", () => {
  // Load test data for iteration
  const allTestData = TestDataLoader.loadContactTestData();
  const testCasesToRun = TestDataLoader.getTestCasesToRun();
  const dataToTest = TestDataLoader.filterTestData(allTestData, testCasesToRun);

  test.beforeAll(() => {
    if (testCasesToRun.length > 0) {
      console.log(`Running selected test cases: ${testCasesToRun.join(", ")}`);
    } else {
      console.log("Running all test cases");
    }
  });

  dataToTest.forEach((data) => {
    test(`${data.test_id}: ${data.title}`, async ({ page }) => {
      const contactPage = new ContactPage(page);

      // Handle preconditions
      if (
        data.precondition.includes("and logged in") &&
        !data.precondition.includes("not logged in")
      ) {
        // Login the user
        await contactPage.login();
        console.log(
          `${data.test_id}: Logged in as customer@practicesoftwaretesting.com`
        );
      } else {
        // Navigate to contact page directly
        await contactPage.navigate();
      }

      // Fill form based on test data
      await contactPage.fillFirstName(data.first_name);
      await contactPage.fillLastName(data.last_name);
      await contactPage.fillEmail(data.email);
      await contactPage.selectSubject(data.subject);
      await contactPage.fillMessage(data.message);

      if (data.attachment) {
        await contactPage.attachFile(data.attachment);
      }

      // Submit form
      await contactPage.submitForm();

      // Verify results based on expected outcome
      const shouldPass = data.should_pass === "true";

      if (shouldPass) {
        // Expect success
        const isSuccess = await contactPage.isSuccessMessageVisible();
        expect(isSuccess, `Expected success message for ${data.test_id}`).toBe(
          true
        );

        // Ensure no errors are shown
        const hasErrors = await contactPage.hasAnyError();
        expect(hasErrors, `Expected no errors for ${data.test_id}`).toBe(false);
      } else {
        // Expect failure
        const isSuccess = await contactPage.isSuccessMessageVisible();
        expect(
          isSuccess,
          `Expected no success message for ${data.test_id}`
        ).toBe(false);

        // Verify at least one error is shown
        const hasErrors = await contactPage.hasAnyError();
        expect(hasErrors, `Expected errors for ${data.test_id}`).toBe(true);

        // Log specific errors for debugging
        const fields = [
          "first_name",
          "last_name",
          "email",
          "subject",
          "message",
          "attachment",
        ];
        for (const field of fields) {
          const error = await contactPage.getFieldError(field);
          if (error) {
            console.log(`${data.test_id} - ${field} error: ${error}`);
          }
        }
      }

      // Take screenshot for test evidence
      await page.screenshot({
        path: join(__dirname, "../../screenshots", `${data.test_id}.png`),
        fullPage: true,
      });
    });
  });
});

// Utility test to list all available test cases
test("List available test cases", async () => {
  const testData = TestDataLoader.loadContactTestData();
  console.log("\nAvailable test cases:");
  console.log("=====================");
  testData.forEach((data) => {
    console.log(`${data.test_id}: ${data.title}`);
  });
  console.log(
    '\nTo run specific tests, use: CONTACT_TEST_CASES="TC_CONTACT_001,TC_CONTACT_002" npm test'
  );
});