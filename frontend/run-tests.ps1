# Phase 6 Frontend Testing - Quick Start Script
# This script helps you set up and run the Playwright tests

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Phase 6: Frontend Testing Setup & Execution" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the frontend directory
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the frontend directory" -ForegroundColor Red
    Write-Host "Usage: cd frontend; .\run-tests.ps1" -ForegroundColor Yellow
    exit 1
}

# Function to check if a service is running
function Test-ServiceRunning {
    param($url, $name)
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  $name is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  $name is NOT running" -ForegroundColor Red
        return $false
    }
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$backendRunning = Test-ServiceRunning "http://localhost:4000/health" "Backend API"
$frontendRunning = Test-ServiceRunning "http://localhost:3000" "Frontend App"

Write-Host ""

if (!$backendRunning) {
    Write-Host "WARNING: Backend is not running!" -ForegroundColor Red
    Write-Host "Please start the backend in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 1 }
}

if (!$frontendRunning) {
    Write-Host "WARNING: Frontend is not running!" -ForegroundColor Red
    Write-Host "Please start the frontend in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 1 }
}

# Step 2: Check if Playwright is installed
Write-Host "Step 2: Checking Playwright installation..." -ForegroundColor Yellow
Write-Host ""

if (!(Test-Path "node_modules/@playwright")) {
    Write-Host "Playwright not found. Installing..." -ForegroundColor Yellow
    npm install -D @playwright/test
    npx playwright install chromium
    Write-Host "  Playwright installed!" -ForegroundColor Green
} else {
    Write-Host "  Playwright is installed" -ForegroundColor Green
}

Write-Host ""

# Step 3: Show test options
Write-Host "Step 3: Select test mode..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Available test modes:" -ForegroundColor Cyan
Write-Host "  1. Run all tests (headless)" -ForegroundColor White
Write-Host "  2. Run Phase 6 tests only (headless)" -ForegroundColor White
Write-Host "  3. Run tests with browser visible (headed)" -ForegroundColor White
Write-Host "  4. Run tests in UI mode (interactive)" -ForegroundColor White
Write-Host "  5. Run tests in debug mode" -ForegroundColor White
Write-Host "  6. Run only on Chrome" -ForegroundColor White
Write-Host "  7. View last test report" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-7)"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Running Tests..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "Running all tests (headless)..." -ForegroundColor Yellow
        npx playwright test
    }
    "2" {
        Write-Host "Running Phase 6 tests only..." -ForegroundColor Yellow
        npx playwright test tests/phase6-user-flow.spec.ts
    }
    "3" {
        Write-Host "Running tests with browser visible..." -ForegroundColor Yellow
        npx playwright test --headed
    }
    "4" {
        Write-Host "Opening Playwright UI..." -ForegroundColor Yellow
        npx playwright test --ui
    }
    "5" {
        Write-Host "Running tests in debug mode..." -ForegroundColor Yellow
        npx playwright test --debug
    }
    "6" {
        Write-Host "Running tests on Chrome only..." -ForegroundColor Yellow
        npx playwright test --project=chromium
    }
    "7" {
        Write-Host "Opening test report..." -ForegroundColor Yellow
        npx playwright show-report
    }
    default {
        Write-Host "Invalid option. Running all tests by default..." -ForegroundColor Yellow
        npx playwright test
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Tests Completed!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View detailed report: npx playwright show-report" -ForegroundColor Yellow
Write-Host "Test results saved in: playwright-report/" -ForegroundColor Gray
Write-Host ""
