#!/bin/bash

# Simple Playwright Browser Version Checker
echo "🎭 Playwright Browser Versions"
echo "=============================="

# Check if Playwright is installed
if ! command -v npx >/dev/null 2>&1; then
    echo "❌ NPX not found. Please install Node.js"
    exit 1
fi

# Get Playwright version
echo -n "Playwright: "
if playwright_version=$(npx playwright --version 2>/dev/null); then
    echo "✅ $playwright_version"
else
    echo "❌ Not installed"
    echo ""
    echo "💡 To install Playwright:"
    echo "   npm install @playwright/test"
    echo "   npx playwright install"
    exit 1
fi

echo ""

# Check Playwright browsers directory
PLAYWRIGHT_DIR=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLAYWRIGHT_DIR="$HOME/Library/Caches/ms-playwright"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLAYWRIGHT_DIR="$HOME/.cache/ms-playwright"
else
    PLAYWRIGHT_DIR="$HOME/AppData/Local/ms-playwright"
fi

echo "Browser Cache: $PLAYWRIGHT_DIR"

if [ ! -d "$PLAYWRIGHT_DIR" ]; then
    echo "❌ No browsers installed"
    echo ""
    echo "💡 To install browsers:"
    echo "   npx playwright install"
    exit 1
fi

echo ""
echo "🌐 Installed Browsers:"
echo "---------------------"

# Count browsers
browser_count=0

# Check for browsers
for browser_dir in "$PLAYWRIGHT_DIR"/*; do
    if [ -d "$browser_dir" ]; then
        dirname=$(basename "$browser_dir")
        
        # Parse browser info
        if [[ $dirname =~ ^chromium-([0-9]+)$ ]]; then
            version=${BASH_REMATCH[1]}
            size=$(du -sh "$browser_dir" 2>/dev/null | cut -f1)
            echo "✅ Chromium        v$version ($size)"
            ((browser_count++))
        elif [[ $dirname =~ ^firefox-([0-9]+)$ ]]; then
            version=${BASH_REMATCH[1]}
            size=$(du -sh "$browser_dir" 2>/dev/null | cut -f1)
            echo "✅ Firefox         v$version ($size)"
            ((browser_count++))
        elif [[ $dirname =~ ^webkit-([0-9]+)$ ]]; then
            version=${BASH_REMATCH[1]}
            size=$(du -sh "$browser_dir" 2>/dev/null | cut -f1)
            echo "✅ WebKit          v$version ($size)"
            ((browser_count++))
        elif [[ $dirname =~ ^msedge-([0-9.]+)$ ]]; then
            version=${BASH_REMATCH[1]}
            size=$(du -sh "$browser_dir" 2>/dev/null | cut -f1)
            echo "✅ Microsoft Edge  v$version ($size)"
            ((browser_count++))
        fi
    fi
done

echo ""
echo "📊 Total: $browser_count browsers installed"

# Check configuration files
echo ""
echo "🔧 Available Configurations:"
echo "---------------------------"

config_files=("playwright.config.ts" "playwright.config.js" "playwright-contact.config.ts")
for config in "${config_files[@]}"; do
    if [ -f "$config" ]; then
        echo "✅ $config"
        
        # Extract project names
        if grep -q "name:" "$config"; then
            echo "   Projects:"
            grep "name:" "$config" | sed -n 's/.*name: *['\''\"]\([^'\''\"]*\)['\''\"]/   • \1/p' | head -10
        fi
        echo ""
    fi
done

# Show usage examples
echo ""
echo "🚀 Quick Commands:"
echo "-----------------"
echo "Run all tests:        npm test"
echo "Run Chrome only:      npx playwright test --project=chromium"
echo "Run Firefox only:     npx playwright test --project=firefox"
echo "Run WebKit only:      npx playwright test --project=webkit"
echo "Update browsers:      npx playwright install"
echo "Browser versions:     node playwright-browser-versions.js"