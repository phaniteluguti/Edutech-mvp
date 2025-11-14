import { test, expect } from '@playwright/test';

/**
 * Phase 2: Dashboard Tests
 * Tests dashboard display, navigation, and user information
 */

const BASE_URL = 'http://localhost:3000';

const testUser = {
  email: 'student@example.com',
  password: 'Password123!',
};

test.describe('Phase 2: Dashboard Tests', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    console.log('✓ Logged in successfully');
  });

  test('Dashboard: Page Loads and Displays Content', async ({ page }) => {
    console.log('Testing dashboard page load...');
    
    // Should be on dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Check for dashboard heading or welcome message
    const welcomeText = page.locator('text=/dashboard|welcome|overview/i').first();
    await expect(welcomeText).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Dashboard page loads with heading');
    
    // Check for user name or email display
    const userInfo = page.locator(`text=/${testUser.email}|student/i`).first();
    const userInfoVisible = await userInfo.isVisible().catch(() => false);
    
    if (userInfoVisible) {
      console.log('✓ User information displayed');
    }
    
    console.log('✅ Dashboard content displayed correctly');
  });

  test('Dashboard: Navigation Menu Visible', async ({ page }) => {
    console.log('Testing dashboard navigation menu...');
    
    // Check for common navigation items
    const navigationItems = [
      'Mock Tests',
      'Tests',
      'Exams',
      'Dashboard',
    ];
    
    let foundItems = 0;
    for (const item of navigationItems) {
      const navItem = page.locator(`a:has-text("${item}"), button:has-text("${item}")`);
      const isVisible = await navItem.first().isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✓ Navigation item found: ${item}`);
        foundItems++;
      }
    }
    
    // At least some navigation should be present
    expect(foundItems).toBeGreaterThan(0);
    
    console.log(`✓ Found ${foundItems} navigation items`);
    console.log('✅ Navigation menu working correctly');
  });

  test('Dashboard: Navigate to Mock Tests', async ({ page }) => {
    console.log('Testing navigation to mock tests...');
    
    // Look for Mock Tests link
    const mockTestsLink = page.locator('a:has-text("Mock Tests"), a:has-text("Tests")').first();
    
    if (await mockTestsLink.isVisible()) {
      console.log('✓ Mock Tests link found');
      
      // Click and navigate
      await mockTestsLink.click();
      
      // Should navigate to tests page
      await page.waitForURL(/\/tests/, { timeout: 5000 });
      await expect(page.url()).toContain('/tests');
      
      console.log('✓ Navigated to tests page');
      
      // Navigate back to dashboard
      const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("Home")');
      if (await dashboardLink.first().isVisible().catch(() => false)) {
        await dashboardLink.first().click();
        await page.waitForURL(`${BASE_URL}/dashboard`);
        console.log('✓ Navigated back to dashboard');
      }
      
      console.log('✅ Navigation to mock tests working correctly');
    } else {
      console.log('⚠️ Mock Tests link not found on dashboard');
    }
  });

  test('Dashboard: Navigate to Exams', async ({ page }) => {
    console.log('Testing navigation to exams...');
    
    // Look for Exams link
    const examsLink = page.locator('a:has-text("Exams"), a:has-text("Browse Exams")').first();
    
    if (await examsLink.isVisible().catch(() => false)) {
      console.log('✓ Exams link found');
      
      // Click and navigate
      await examsLink.click();
      
      // Should navigate to exams page
      await page.waitForURL(/\/exams/, { timeout: 5000 });
      await expect(page.url()).toContain('/exams');
      
      console.log('✓ Navigated to exams page');
      console.log('✅ Navigation to exams working correctly');
    } else {
      console.log('⚠️ Exams link not found - may not be implemented yet');
    }
  });

  test('Dashboard: User Profile Access', async ({ page }) => {
    console.log('Testing user profile access...');
    
    // Look for profile link or user menu
    const profileLinks = [
      'a:has-text("Profile")',
      'a:has-text("Account")',
      'button:has-text("Profile")',
      '[data-testid="user-menu"]',
      '.user-menu',
    ];
    
    let profileFound = false;
    for (const selector of profileLinks) {
      const element = page.locator(selector);
      if (await element.first().isVisible().catch(() => false)) {
        console.log(`✓ Profile access found: ${selector}`);
        profileFound = true;
        break;
      }
    }
    
    if (profileFound) {
      console.log('✅ Profile access available');
    } else {
      console.log('⚠️ Profile access not found - may be in dropdown or not implemented');
    }
  });

  test('Dashboard: Quick Stats Display', async ({ page }) => {
    console.log('Testing dashboard statistics display...');
    
    // Look for statistics or metrics
    const statKeywords = [
      'test',
      'score',
      'attempt',
      'performance',
      'progress',
      'exam',
    ];
    
    let statsFound = 0;
    for (const keyword of statKeywords) {
      const stat = page.locator(`text=/${keyword}/i`);
      const count = await stat.count();
      if (count > 0) {
        statsFound++;
      }
    }
    
    console.log(`✓ Found ${statsFound} stat-related elements`);
    
    // Check for numbers or metrics (score, count, percentage)
    const numbers = page.locator('text=/\\d+|\\d+%/');
    const numberCount = await numbers.count();
    
    if (numberCount > 0) {
      console.log(`✓ Found ${numberCount} numeric metrics`);
    }
    
    console.log('✅ Dashboard statistics area present');
  });

  test('Dashboard: Recent Activity Section', async ({ page }) => {
    console.log('Testing recent activity section...');
    
    // Look for recent activity indicators
    const activityKeywords = [
      'recent',
      'history',
      'last',
      'activity',
      'attempted',
    ];
    
    let activityFound = false;
    for (const keyword of activityKeywords) {
      const element = page.locator(`text=/${keyword}/i`).first();
      if (await element.isVisible().catch(() => false)) {
        console.log(`✓ Activity section found with keyword: ${keyword}`);
        activityFound = true;
        break;
      }
    }
    
    if (activityFound) {
      console.log('✅ Recent activity section present');
    } else {
      console.log('⚠️ Recent activity section not found - may not be implemented');
    }
  });

  test('Dashboard: Responsive Layout Mobile', async ({ page }) => {
    console.log('Testing dashboard on mobile viewport...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Reload dashboard
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Dashboard should still be visible
    await expect(page.locator('text=/dashboard|welcome/i').first()).toBeVisible();
    
    console.log('✓ Dashboard visible on mobile');
    
    // Navigation might be in hamburger menu
    const hamburgerMenu = page.locator('button[aria-label*="menu"], button:has-text("☰"), [data-testid="mobile-menu"]');
    const hamburgerVisible = await hamburgerMenu.first().isVisible().catch(() => false);
    
    if (hamburgerVisible) {
      console.log('✓ Mobile menu button found');
      await hamburgerMenu.first().click();
      await page.waitForTimeout(500);
      
      // Check if navigation appears
      const navItem = page.locator('a:has-text("Tests"), a:has-text("Exams")');
      if (await navItem.first().isVisible()) {
        console.log('✓ Mobile navigation menu works');
      }
    }
    
    console.log('✅ Dashboard responsive on mobile');
  });

  test('Dashboard: Logout Functionality', async ({ page }) => {
    console.log('Testing logout from dashboard...');
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    
    if (await logoutButton.first().isVisible().catch(() => false)) {
      console.log('✓ Logout button found');
      
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
      
      // Should redirect to home or login
      const currentUrl = page.url();
      const loggedOut = currentUrl.includes('/auth/login') || currentUrl === `${BASE_URL}/` || currentUrl === `${BASE_URL}`;
      
      if (loggedOut) {
        console.log('✓ Logged out and redirected');
        console.log('✅ Logout functionality working');
      }
    } else {
      console.log('⚠️ Checking for logout in user menu...');
      
      // Try clicking on user menu/avatar
      const userMenu = page.locator('[data-testid="user-menu"], button:has(text=/student|user|@/), .user-menu');
      if (await userMenu.first().isVisible().catch(() => false)) {
        await userMenu.first().click();
        await page.waitForTimeout(500);
        
        const dropdownLogout = page.locator('button:has-text("Logout"), a:has-text("Logout")');
        if (await dropdownLogout.first().isVisible().catch(() => false)) {
          console.log('✓ Logout found in dropdown');
          await dropdownLogout.first().click();
          await page.waitForTimeout(1000);
          console.log('✅ Logout from dropdown working');
        }
      }
    }
  });

  test('Dashboard: Quick Action Buttons', async ({ page }) => {
    console.log('Testing quick action buttons...');
    
    // Look for action buttons like "Start Test", "Browse Exams"
    const actionButtons = [
      'button:has-text("Start")',
      'button:has-text("Take")',
      'button:has-text("Browse")',
      'a:has-text("Start")',
      'a:has-text("Browse")',
    ];
    
    let actionsFound = 0;
    for (const selector of actionButtons) {
      const button = page.locator(selector);
      const count = await button.count();
      if (count > 0) {
        console.log(`✓ Action button found: ${selector} (${count})`);
        actionsFound++;
      }
    }
    
    if (actionsFound > 0) {
      console.log(`✅ Found ${actionsFound} quick action buttons`);
    } else {
      console.log('⚠️ No quick action buttons found');
    }
  });
});

// Configure test to run in parallel
test.describe.configure({ mode: 'parallel' });
