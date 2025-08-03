import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";

export interface ContactTestData {
  test_id: string;
  title: string;
  precondition: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  attachment: string;
  expected_result: string;
  should_pass: string;
}

export class TestDataLoader {
  static loadContactTestData(): ContactTestData[] {
    const csvPath = join(__dirname, "../test-data/contact_test_data.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });
  }

  static getTestCasesToRun(): string[] {
    const selectedTests = process.env.CONTACT_TEST_CASES;
    if (selectedTests) {
      return selectedTests.split(",").map((id) => id.trim());
    }
    return []; // Empty array means run all
  }

  static filterTestData(testData: ContactTestData[], testCaseIds: string[]): ContactTestData[] {
    if (testCaseIds.length === 0) {
      return testData;
    }
    return testData.filter((data) => testCaseIds.includes(data.test_id));
  }
}