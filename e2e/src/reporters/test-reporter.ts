import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

interface TestSummary {
  testId: string;
  title: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  errors: string[];
  timestamp: string;
  browser: string;
  screenshot?: string;
}

export class ContactFormReporter implements Reporter {
  private results: TestSummary[] = [];
  private startTime: Date;
  private reportDir: string;

  constructor() {
    this.reportDir = join(__dirname, "test-reports");
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  onBegin() {
    this.startTime = new Date();
    console.log("\n📋 Contact Form Test Execution Started\n");
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testIdMatch = test.title.match(/^(TC_CONTACT_\d+):/);
    const testId = testIdMatch ? testIdMatch[1] : "UNKNOWN";

    const summary: TestSummary = {
      testId,
      title: test.title,
      status: result.status as "passed" | "failed" | "skipped",
      duration: result.duration,
      errors: result.errors.map((e) => e.message || e.toString()),
      timestamp: new Date().toISOString(),
      browser: test.parent?.project()?.name || "unknown",
      screenshot: result.attachments.find((a) => a.name === "screenshot")?.path,
    };

    this.results.push(summary);

    // Console output with colors
    const statusSymbol = {
      passed: "✅",
      failed: "❌",
      skipped: "⏭️",
    };

    console.log(
      `${statusSymbol[summary.status]} ${
        summary.testId
      } - ${summary.status.toUpperCase()} (${summary.duration}ms)`
    );

    if (summary.errors.length > 0) {
      console.log(`   └─ Error: ${summary.errors[0]}`);
    }
  }

  async onEnd(result: FullResult) {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();

    // Generate summary statistics
    const stats = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "passed").length,
      failed: this.results.filter((r) => r.status === "failed").length,
      skipped: this.results.filter((r) => r.status === "skipped").length,
      duration: totalDuration,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    // Generate detailed HTML report
    const htmlReport = this.generateHTMLReport(stats);
    const htmlPath = join(
      this.reportDir,
      `contact-form-report-${Date.now()}.html`
    );
    writeFileSync(htmlPath, htmlReport);

    // Generate JSON report
    const jsonReport = {
      stats,
      results: this.results,
    };
    const jsonPath = join(
      this.reportDir,
      `contact-form-report-${Date.now()}.json`
    );
    writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // Generate CSV report for easy analysis
    const csvReport = this.generateCSVReport();
    const csvPath = join(
      this.reportDir,
      `contact-form-report-${Date.now()}.csv`
    );
    writeFileSync(csvPath, csvReport);

    // Console summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST EXECUTION SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Tests: ${stats.total}`);
    console.log(
      `✅ Passed: ${stats.passed} (${(
        (stats.passed / stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `❌ Failed: ${stats.failed} (${(
        (stats.failed / stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log("=".repeat(80));
    console.log(`\n📄 Reports generated:`);
    console.log(`   - HTML: ${htmlPath}`);
    console.log(`   - JSON: ${jsonPath}`);
    console.log(`   - CSV: ${csvPath}\n`);
  }

  private generateHTMLReport(stats: any): string {
    const failedTests = this.results.filter((r) => r.status === "failed");
    const passedTests = this.results.filter((r) => r.status === "passed");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .skipped { color: #f39c12; }
        .test-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background-color: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
        }
        .status-passed {
            background-color: #d4edda;
            color: #155724;
        }
        .status-failed {
            background-color: #f8d7da;
            color: #721c24;
        }
        .status-skipped {
            background-color: #fff3cd;
            color: #856404;
        }
        .error-message {
            color: #e74c3c;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .section-title {
            font-size: 1.5em;
            margin: 30px 0 20px 0;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Contact Form Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Duration: ${(stats.duration / 1000).toFixed(2)} seconds</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">Total Tests</div>
            <div class="stat-number">${stats.total}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Passed</div>
            <div class="stat-number passed">${stats.passed}</div>
            <div>${((stats.passed / stats.total) * 100).toFixed(1)}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Failed</div>
            <div class="stat-number failed">${stats.failed}</div>
            <div>${((stats.failed / stats.total) * 100).toFixed(1)}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Skipped</div>
            <div class="stat-number skipped">${stats.skipped}</div>
        </div>
    </div>

    ${
      failedTests.length > 0
        ? `
    <h2 class="section-title">Failed Tests</h2>
    <div class="test-table">
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Title</th>
                    <th>Browser</th>
                    <th>Duration</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${failedTests
                  .map(
                    (test) => `
                <tr>
                    <td><strong>${test.testId}</strong></td>
                    <td>${test.title}</td>
                    <td>${test.browser}</td>
                    <td>${test.duration}ms</td>
                    <td>
                        <div class="error-message">${test.errors.join(
                          "<br>"
                        )}</div>
                    </td>
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
    `
        : ""
    }

    <h2 class="section-title">All Test Results</h2>
    <div class="test-table">
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Browser</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${this.results
                  .map(
                    (test) => `
                <tr>
                    <td><strong>${test.testId}</strong></td>
                    <td>${test.title}</td>
                    <td>
                        <span class="status-badge status-${
                          test.status
                        }">${test.status.toUpperCase()}</span>
                    </td>
                    <td>${test.browser}</td>
                    <td>${test.duration}ms</td>
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
</body>
</html>
    `;
  }

  private generateCSVReport(): string {
    const headers = [
      "Test ID",
      "Title",
      "Status",
      "Browser",
      "Duration (ms)",
      "Errors",
    ];
    const rows = this.results.map((r) => [
      r.testId,
      `"${r.title.replace(/"/g, '""')}"`,
      r.status,
      r.browser,
      r.duration.toString(),
      `"${r.errors.join("; ").replace(/"/g, '""')}"`,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}

export default ContactFormReporter;

import { test, expect } from "@playwright/test";
