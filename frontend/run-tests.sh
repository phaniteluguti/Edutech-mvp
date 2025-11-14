#!/bin/bash

# Phase 6 Frontend Testing - Quick Start Script (Bash version)
# This script helps you set up and run the Playwright tests

echo "================================================"
echo "  Phase 6: Frontend Testing Setup & Execution"
echo "================================================"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "ERROR: Please run this script from the frontend directory"
    echo "Usage: cd frontend && ./run-tests.sh"
    exit 1
fi

# Function to check if a service is running
check_service() {
    url=$1
    name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo "  ✓ $name is running"
        return 0
    else
        echo "  ✗ $name is NOT running"
        return 1
    fi
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

backend_running=0
frontend_running=0

if check_service "http://localhost:4000/health" "Backend API"; then
    backend_running=1
fi

if check_service "http://localhost:3000" "Frontend App"; then
    frontend_running=1
fi

echo ""

if [ $backend_running -eq 0 ]; then
    echo "WARNING: Backend is not running!"
    echo "Please start the backend in a separate terminal:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [ $frontend_running -eq 0 ]; then
    echo "WARNING: Frontend is not running!"
    echo "Please start the frontend in a separate terminal:"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Check if Playwright is installed
echo "Step 2: Checking Playwright installation..."
echo ""

if [ ! -d "node_modules/@playwright" ]; then
    echo "Playwright not found. Installing..."
    npm install -D @playwright/test
    npx playwright install chromium
    echo "  ✓ Playwright installed!"
else
    echo "  ✓ Playwright is installed"
fi

echo ""

# Step 3: Show test options
echo "Step 3: Select test mode..."
echo ""
echo "Available test modes:"
echo "  1. Run all tests (headless)"
echo "  2. Run Phase 6 tests only (headless)"
echo "  3. Run tests with browser visible (headed)"
echo "  4. Run tests in UI mode (interactive)"
echo "  5. Run tests in debug mode"
echo "  6. Run only on Chrome"
echo "  7. View last test report"
echo ""

read -p "Select option (1-7): " choice

echo ""
echo "================================================"
echo "  Running Tests..."
echo "================================================"
echo ""

case $choice in
    1)
        echo "Running all tests (headless)..."
        npx playwright test
        ;;
    2)
        echo "Running Phase 6 tests only..."
        npx playwright test tests/phase6-user-flow.spec.ts
        ;;
    3)
        echo "Running tests with browser visible..."
        npx playwright test --headed
        ;;
    4)
        echo "Opening Playwright UI..."
        npx playwright test --ui
        ;;
    5)
        echo "Running tests in debug mode..."
        npx playwright test --debug
        ;;
    6)
        echo "Running tests on Chrome only..."
        npx playwright test --project=chromium
        ;;
    7)
        echo "Opening test report..."
        npx playwright show-report
        ;;
    *)
        echo "Invalid option. Running all tests by default..."
        npx playwright test
        ;;
esac

echo ""
echo "================================================"
echo "  Tests Completed!"
echo "================================================"
echo ""
echo "View detailed report: npx playwright show-report"
echo "Test results saved in: playwright-report/"
echo ""
