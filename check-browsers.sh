#!/bin/bash

# Browser Version Detection Script
# Simple shell script to detect browser versions

echo "🔍 Browser Version Detection Script"
echo "=================================="
echo "Platform: $(uname -s) $(uname -m)"
echo "Date: $(date)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check browser version
check_browser() {
    local browser_name="$1"
    local browser_command="$2"
    local icon="$3"
    
    printf "${icon} %-20s" "$browser_name"
    
    if command -v "$browser_command" >/dev/null 2>&1; then
        version=$($browser_command --version 2>/dev/null | head -n1)
        if [ -n "$version" ]; then
            echo -e "${GREEN}✅ $version${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Not found${NC}"
    return 1
}

# Function to check browser by path (macOS)
check_browser_path() {
    local browser_name="$1"
    local browser_path="$2"
    local icon="$3"
    
    printf "${icon} %-20s" "$browser_name"
    
    if [ -f "$browser_path" ]; then
        version=$("$browser_path" --version 2>/dev/null | head -n1)
        if [ -n "$version" ]; then
            echo -e "${GREEN}✅ $version${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Not found${NC}"
    return 1
}

echo "🌐 Checking Installed Browsers:"
echo "-------------------------------"

found_count=0
total_count=0

# Chrome
total_count=$((total_count + 1))
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if check_browser_path "Google Chrome" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "🟦"; then
        found_count=$((found_count + 1))
    fi
else
    # Linux/Windows
    if check_browser "Google Chrome" "google-chrome" "🟦" || check_browser "Google Chrome" "chrome" "🟦"; then
        found_count=$((found_count + 1))
    fi
fi

# Firefox
total_count=$((total_count + 1))
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if check_browser_path "Mozilla Firefox" "/Applications/Firefox.app/Contents/MacOS/firefox" "🟠"; then
        found_count=$((found_count + 1))
    fi
else
    # Linux/Windows
    if check_browser "Mozilla Firefox" "firefox" "🟠"; then
        found_count=$((found_count + 1))
    fi
fi

# Edge
total_count=$((total_count + 1))
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if check_browser_path "Microsoft Edge" "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" "🟢"; then
        found_count=$((found_count + 1))
    fi
else
    # Linux/Windows
    if check_browser "Microsoft Edge" "microsoft-edge" "🟢" || check_browser "Microsoft Edge" "msedge" "🟢"; then
        found_count=$((found_count + 1))
    fi
fi

# Safari (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    total_count=$((total_count + 1))
    printf "🔵 %-20s" "Safari"
    
    # Safari version is tricky, try different methods
    safari_version=$(defaults read /Applications/Safari.app/Contents/Info CFBundleShortVersionString 2>/dev/null)
    if [ -n "$safari_version" ]; then
        echo -e "${GREEN}✅ Safari $safari_version${NC}"
        found_count=$((found_count + 1))
    else
        echo -e "${RED}❌ Not found${NC}"
    fi
fi

echo ""
echo "📊 Summary:"
echo "----------"
echo -e "Found: ${GREEN}$found_count${NC}/$total_count browsers"

# Check Playwright
echo ""
echo "🎭 Automation Tools:"
echo "-------------------"
printf "%-20s" "Playwright"
if command -v playwright >/dev/null 2>&1; then
    playwright_version=$(playwright --version 2>/dev/null)
    if [ -n "$playwright_version" ]; then
        echo -e "${GREEN}✅ $playwright_version${NC}"
    else
        echo -e "${RED}❌ Command found but version failed${NC}"
    fi
elif command -v npx >/dev/null 2>&1; then
    playwright_version=$(npx playwright --version 2>/dev/null)
    if [ -n "$playwright_version" ]; then
        echo -e "${GREEN}✅ $playwright_version${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
    fi
else
    echo -e "${RED}❌ NPX not available${NC}"
fi

# Node.js version
printf "%-20s" "Node.js"
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version 2>/dev/null)
    echo -e "${GREEN}✅ $node_version${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

# NPM version
printf "%-20s" "NPM"
if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm --version 2>/dev/null)
    echo -e "${GREEN}✅ v$npm_version${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

echo ""
echo "🔧 Usage Examples:"
echo "-----------------"
echo "  ./check-browsers.sh              # Full report"
echo "  ./check-browsers.sh > report.txt # Save to file"
echo ""

# Return success/failure based on found browsers
if [ $found_count -gt 0 ]; then
    echo -e "${GREEN}✅ Browser detection completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}❌ No browsers found!${NC}"
    exit 1
fi