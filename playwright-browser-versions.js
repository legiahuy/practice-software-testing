#!/usr/bin/env node

/**
 * Playwright Browser Version Detection Script
 * Detects versions of browsers installed by Playwright for testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PlaywrightBrowserDetector {
  constructor() {
    this.playwrightDir = this.getPlaywrightDirectory();
  }

  /**
   * Get Playwright browsers directory
   */
  getPlaywrightDirectory() {
    const homeDir = os.homedir();
    const possiblePaths = [
      path.join(homeDir, '.cache', 'ms-playwright'),  // Linux
      path.join(homeDir, 'Library', 'Caches', 'ms-playwright'),  // macOS
      path.join(homeDir, 'AppData', 'Local', 'ms-playwright'),  // Windows
      path.join(process.cwd(), 'node_modules', 'playwright', '.local-browsers')  // Local install
    ];

    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }
    return null;
  }

  /**
   * Execute command safely
   */
  executeCommand(command) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Playwright version
   */
  getPlaywrightVersion() {
    // Try npx first
    let version = this.executeCommand('npx playwright --version');
    if (version) return version;

    // Try direct playwright command
    version = this.executeCommand('playwright --version');
    if (version) return version;

    // Try from package.json
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const playwrightVersion = pkg.dependencies?.['@playwright/test'] || 
                                pkg.devDependencies?.['@playwright/test'] ||
                                pkg.dependencies?.playwright ||
                                pkg.devDependencies?.playwright;
        if (playwrightVersion) {
          return `Playwright ${playwrightVersion.replace('^', '').replace('~', '')}`;
        }
      }
    } catch (error) {
      // Ignore
    }

    return null;
  }

  /**
   * Get installed Playwright browsers
   */
  getInstalledBrowsers() {
    const browsers = [];

    if (!this.playwrightDir || !fs.existsSync(this.playwrightDir)) {
      return browsers;
    }

    try {
      const entries = fs.readdirSync(this.playwrightDir);
      
      for (const entry of entries) {
        const fullPath = path.join(this.playwrightDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Parse browser info from directory name
          const browserInfo = this.parseBrowserDirectory(entry, fullPath);
          if (browserInfo) {
            browsers.push(browserInfo);
          }
        }
      }
    } catch (error) {
      console.error('Error reading Playwright directory:', error.message);
    }

    return browsers;
  }

  /**
   * Parse browser directory name to extract browser info
   */
  parseBrowserDirectory(dirName, fullPath) {
    // Common Playwright browser directory patterns:
    // chromium-1091
    // firefox-1345
    // webkit-1967
    // msedge-109.0.1518.49
    
    const patterns = [
      { regex: /^chromium-(\d+)$/, name: 'Chromium', type: 'chromium' },
      { regex: /^firefox-(\d+)$/, name: 'Firefox', type: 'firefox' },
      { regex: /^webkit-(\d+)$/, name: 'WebKit', type: 'webkit' },
      { regex: /^msedge-([\d.]+)$/, name: 'Microsoft Edge', type: 'msedge' }
    ];

    for (const pattern of patterns) {
      const match = dirName.match(pattern.regex);
      if (match) {
        const version = match[1];
        const executablePath = this.findBrowserExecutable(fullPath, pattern.type);
        
        return {
          name: pattern.name,
          type: pattern.type,
          version: version,
          directory: dirName,
          path: fullPath,
          executable: executablePath,
          size: this.getDirectorySize(fullPath)
        };
      }
    }

    return null;
  }

  /**
   * Find browser executable in directory
   */
  findBrowserExecutable(browserDir, browserType) {
    const executableNames = {
      chromium: ['chrome', 'chromium', 'Chromium.app'],
      firefox: ['firefox', 'Firefox.app'],
      webkit: ['Playwright.app', 'MiniBrowser', 'webkit'],
      msedge: ['msedge', 'Microsoft Edge.app']
    };

    const names = executableNames[browserType] || [];
    
    for (const name of names) {
      const possiblePaths = [
        path.join(browserDir, name),
        path.join(browserDir, 'chrome-linux', name),
        path.join(browserDir, 'chrome-mac', name),
        path.join(browserDir, 'firefox', name),
        path.join(browserDir, 'webkit', name)
      ];

      for (const execPath of possiblePaths) {
        if (fs.existsSync(execPath)) {
          return execPath;
        }
      }
    }

    return null;
  }

  /**
   * Get directory size in MB
   */
  getDirectorySize(dirPath) {
    try {
      const output = this.executeCommand(`du -sm "${dirPath}"`);
      if (output) {
        const size = parseInt(output.split('\t')[0]);
        return `${size} MB`;
      }
    } catch (error) {
      // Ignore
    }
    return 'Unknown';
  }

  /**
   * Get browser version from executable
   */
  getBrowserExecutableVersion(executablePath, browserType) {
    if (!executablePath || !fs.existsSync(executablePath)) {
      return null;
    }

    try {
      const versionOutput = this.executeCommand(`"${executablePath}" --version`);
      if (versionOutput) {
        return this.parseVersionOutput(versionOutput, browserType);
      }
    } catch (error) {
      // Ignore
    }

    return null;
  }

  /**
   * Parse version output
   */
  parseVersionOutput(output, browserType) {
    const patterns = {
      chromium: /Chrome\/(\d+\.\d+\.\d+\.\d+)/i,
      firefox: /Firefox (\d+\.\d+(?:\.\d+)?)/i,
      webkit: /Version\/(\d+\.\d+(?:\.\d+)?)/i,
      msedge: /Edge\/(\d+\.\d+\.\d+\.\d+)/i
    };

    if (patterns[browserType]) {
      const match = output.match(patterns[browserType]);
      if (match) {
        return match[1];
      }
    }

    // Generic fallback
    const genericMatch = output.match(/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/);
    return genericMatch ? genericMatch[1] : output.split('\n')[0];
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('🎭 Playwright Browser Version Report');
    console.log('===================================');
    
    const playwrightVersion = this.getPlaywrightVersion();
    if (playwrightVersion) {
      console.log(`Playwright: ${playwrightVersion}`);
    } else {
      console.log('❌ Playwright not found');
      return;
    }

    console.log(`Platform: ${process.platform} (${process.arch})`);
    console.log(`Cache Dir: ${this.playwrightDir || 'Not found'}`);
    console.log(`Scan Time: ${new Date().toISOString()}\n`);

    const browsers = this.getInstalledBrowsers();
    
    if (browsers.length === 0) {
      console.log('❌ No Playwright browsers found');
      console.log('\n💡 To install browsers, run:');
      console.log('   npx playwright install');
      return;
    }

    console.log('🌐 Installed Playwright Browsers:');
    console.log('-'.repeat(60));

    browsers.forEach(browser => {
      const executableVersion = this.getBrowserExecutableVersion(browser.executable, browser.type);
      const versionInfo = executableVersion || browser.version;
      
      console.log(`✅ ${browser.name.padEnd(15)} v${versionInfo.padEnd(15)} ${browser.size}`);
      console.log(`   └─ Directory: ${browser.directory}`);
      if (browser.executable) {
        console.log(`   └─ Executable: ${path.basename(browser.executable)}`);
      }
      console.log('');
    });

    console.log(`📊 Summary: ${browsers.length} browsers installed`);
    
    // Show available projects from config
    this.showPlaywrightProjects();
  }

  /**
   * Show Playwright projects from config
   */
  showPlaywrightProjects() {
    const configFiles = [
      'playwright.config.ts',
      'playwright.config.js',
      'playwright-contact.config.ts'
    ];

    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        console.log(`\n🔧 Found config: ${configFile}`);
        try {
          const configContent = fs.readFileSync(configFile, 'utf8');
          const projectMatches = configContent.match(/name:\s*['"]([^'"]+)['"]/g);
          if (projectMatches) {
            console.log('   Projects:');
            projectMatches.forEach(match => {
              const projectName = match.match(/['"]([^'"]+)['"]/)[1];
              console.log(`   • ${projectName}`);
            });
          }
        } catch (error) {
          // Ignore parsing errors
        }
        break;
      }
    }
  }

  /**
   * Run browser installation check
   */
  checkBrowserInstallation() {
    console.log('🔍 Checking Playwright browser installation...\n');
    
    const installOutput = this.executeCommand('npx playwright install --dry-run');
    if (installOutput) {
      console.log('Installation status:');
      console.log(installOutput);
    } else {
      console.log('Could not check installation status');
    }
  }
}

// CLI interface
function main() {
  const detector = new PlaywrightBrowserDetector();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--check-install')) {
    detector.checkBrowserInstallation();
    return;
  }

  if (args.includes('--install')) {
    console.log('🚀 Installing Playwright browsers...');
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      console.log('✅ Installation complete!');
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
    }
    return;
  }

  if (args.includes('--help')) {
    console.log('Playwright Browser Version Detector');
    console.log('');
    console.log('Usage:');
    console.log('  node playwright-browser-versions.js              # Show report');
    console.log('  node playwright-browser-versions.js --install    # Install browsers');
    console.log('  node playwright-browser-versions.js --check-install # Check what needs installing');
    console.log('  node playwright-browser-versions.js --help       # Show this help');
    return;
  }

  detector.generateReport();
}

if (require.main === module) {
  main();
}

module.exports = PlaywrightBrowserDetector;