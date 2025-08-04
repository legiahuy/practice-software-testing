#!/usr/bin/env node

/**
 * Browser Version Detection Script
 * Detects and returns version information for multiple browsers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BrowserVersionDetector {
  constructor() {
    this.browsers = {
      chrome: {
        name: 'Google Chrome',
        paths: [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ],
        versionFlag: '--version'
      },
      firefox: {
        name: 'Mozilla Firefox',
        paths: [
          '/Applications/Firefox.app/Contents/MacOS/firefox',
          '/usr/bin/firefox',
          'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
          'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
        ],
        versionFlag: '--version'
      },
      edge: {
        name: 'Microsoft Edge',
        paths: [
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          '/usr/bin/microsoft-edge',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        ],
        versionFlag: '--version'
      },
      safari: {
        name: 'Safari',
        paths: [
          '/Applications/Safari.app/Contents/MacOS/Safari'
        ],
        versionFlag: '--version'
      }
    };
  }

  /**
   * Check if a file exists at the given path
   */
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute command and return output
   */
  executeCommand(command) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get browser version using executable path
   */
  getBrowserVersion(browserKey) {
    const browser = this.browsers[browserKey];
    
    // Try each possible path
    for (const browserPath of browser.paths) {
      if (this.fileExists(browserPath)) {
        const command = `"${browserPath}" ${browser.versionFlag}`;
        const output = this.executeCommand(command);
        
        if (output) {
          return this.parseVersionOutput(output, browserKey);
        }
      }
    }

    // Try system PATH commands
    const systemCommands = {
      chrome: ['google-chrome --version', 'chrome --version'],
      firefox: ['firefox --version'],
      edge: ['microsoft-edge --version', 'msedge --version'],
      safari: ['safari --version']
    };

    if (systemCommands[browserKey]) {
      for (const cmd of systemCommands[browserKey]) {
        const output = this.executeCommand(cmd);
        if (output) {
          return this.parseVersionOutput(output, browserKey);
        }
      }
    }

    return null;
  }

  /**
   * Parse version output to extract clean version number
   */
  parseVersionOutput(output, browserKey) {
    const lines = output.split('\n')[0]; // Get first line
    
    // Different browsers have different output formats
    const patterns = {
      chrome: /Chrome\/(\d+\.\d+\.\d+\.\d+)/i,
      firefox: /Firefox (\d+\.\d+(?:\.\d+)?)/i,
      edge: /Edge\/(\d+\.\d+\.\d+\.\d+)/i,
      safari: /Version\/(\d+\.\d+(?:\.\d+)?)/i
    };

    // Try specific pattern first
    if (patterns[browserKey]) {
      const match = lines.match(patterns[browserKey]);
      if (match) {
        return match[1];
      }
    }

    // Generic version pattern fallback
    const genericMatch = lines.match(/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/);
    if (genericMatch) {
      return genericMatch[1];
    }

    return lines; // Return raw output if no pattern matches
  }

  /**
   * Get Playwright browser versions
   */
  getPlaywrightVersions() {
    try {
      const output = this.executeCommand('npx playwright --version');
      if (output) {
        return output;
      }
    } catch (error) {
      // Ignore error
    }
    return null;
  }

  /**
   * Detect all browser versions
   */
  detectAllVersions() {
    const results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      browsers: {},
      playwright: null
    };

    console.log('🔍 Detecting Browser Versions...\n');

    // Check each browser
    for (const [key, config] of Object.entries(this.browsers)) {
      process.stdout.write(`Checking ${config.name}... `);
      
      const version = this.getBrowserVersion(key);
      
      if (version) {
        results.browsers[key] = {
          name: config.name,
          version: version,
          status: 'found'
        };
        console.log(`✅ v${version}`);
      } else {
        results.browsers[key] = {
          name: config.name,
          version: null,
          status: 'not found'
        };
        console.log('❌ Not found');
      }
    }

    // Check Playwright
    console.log('\nChecking Playwright...');
    const playwrightVersion = this.getPlaywrightVersions();
    if (playwrightVersion) {
      results.playwright = playwrightVersion;
      console.log(`✅ ${playwrightVersion}`);
    } else {
      console.log('❌ Playwright not found');
    }

    return results;
  }

  /**
   * Generate summary report
   */
  generateReport(results) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 BROWSER VERSION REPORT');
    console.log('='.repeat(50));
    
    console.log(`Platform: ${results.platform} (${results.arch})`);
    console.log(`Scan Time: ${results.timestamp}\n`);

    // Browser versions table
    console.log('🌐 Installed Browsers:');
    console.log('-'.repeat(40));
    
    let foundCount = 0;
    for (const [key, info] of Object.entries(results.browsers)) {
      const status = info.status === 'found' ? '✅' : '❌';
      const version = info.version || 'Not installed';
      console.log(`${status} ${info.name.padEnd(20)} ${version}`);
      if (info.status === 'found') foundCount++;
    }

    console.log(`\n📈 Summary: ${foundCount}/${Object.keys(results.browsers).length} browsers found`);

    // Playwright info
    if (results.playwright) {
      console.log(`🎭 Automation: ${results.playwright}`);
    }

    console.log('\n' + '='.repeat(50));
  }

  /**
   * Save results to JSON file
   */
  saveResults(results) {
    const filename = `browser-versions-${Date.now()}.json`;
    try {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`💾 Results saved to: ${filename}`);
    } catch (error) {
      console.log(`❌ Failed to save results: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  const detector = new BrowserVersionDetector();
  
  try {
    const results = detector.detectAllVersions();
    detector.generateReport(results);
    
    // Save results if requested
    if (process.argv.includes('--save')) {
      detector.saveResults(results);
    }

    // Return specific browser version if requested
    const browserArg = process.argv.find(arg => arg.startsWith('--browser='));
    if (browserArg) {
      const browserName = browserArg.split('=')[1];
      const browserInfo = results.browsers[browserName];
      if (browserInfo && browserInfo.status === 'found') {
        console.log(`\n${browserInfo.name}: ${browserInfo.version}`);
        process.exit(0);
      } else {
        console.log(`\n❌ ${browserName} not found`);
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Error detecting browser versions:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = BrowserVersionDetector;