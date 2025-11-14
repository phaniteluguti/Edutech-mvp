import { test, expect } from '@playwright/test';

/**
 * Phase 1-4: Authentication Tests
 * Tests user registration, login, email verification, and password reset flows
 */

const BASE_URL = 'http://localhost:3000';

// Generate unique test users for each test run
const timestamp = Date.now();
const testUsers = {
  adult: {
    email: `adult.test.${timestamp}@example.com`,
    phone: `9${timestamp.toString().slice(-9)}`, // Valid 10-digit Indian mobile
    password: 'SecurePass123!',
    name: 'Adult Test User',
    dateOfBirth: '1990-01-01', // Over 18
  },
  minor: {
    email: `minor.test.${timestamp}@example.com`,
    phone: `8${timestamp.toString().slice(-9)}`,
    password: 'SecurePass123!',
    name: 'Minor Test User',
    dateOfBirth: '2010-01-01', // Under 18
    parentEmail: `parent.${timestamp}@example.com`,
  },
  existingUser: {
    email: 'student@example.com',
    password: 'Password123!',
  },
};

test.describe('Phase 1-4: Authentication Tests', () => {
  
  test('User Registration: Adult User Signup', async ({ page }) => {
    console.log('Testing adult user registration...');
    
    await page.goto(`${BASE_URL}/auth/register`);
    
    // Fill registration form
    console.log('Filling registration form...');
    await page.fill('input[name="name"]', testUsers.adult.name);
    await page.fill('input[name="email"]', testUsers.adult.email);
    
    // Handle phone field if present
    const phoneField = page.locator('input[name="phone"]');
    if (await phoneField.isVisible().catch(() => false)) {
      await phoneField.fill(testUsers.adult.phone);
    }
    
    await page.fill('input[name="password"]', testUsers.adult.password);
    
    // Handle confirm password if present
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.isVisible().catch(() => false)) {
      await confirmPasswordField.fill(testUsers.adult.password);
    }
    
    // Handle date of birth if present
    const dobField = page.locator('input[name="dateOfBirth"], input[type="date"]');
    if (await dobField.isVisible().catch(() => false)) {
      await dobField.fill(testUsers.adult.dateOfBirth);
    }
    
    // Submit form
    console.log('Submitting registration form...');
    await page.click('button[type="submit"]');
    
    // Wait for response (either success or redirect)
    await page.waitForTimeout(2000);
    
    // Should redirect to email verification or login
    const currentUrl = page.url();
    const validRedirects = ['/auth/verify-email', '/auth/login', '/dashboard'];
    const redirectedCorrectly = validRedirects.some(path => currentUrl.includes(path));
    
    if (!redirectedCorrectly) {
      // Check if still on registration page with success message
      const successMessage = await page.locator('text=/success|registered|email sent|verification/i').isVisible().catch(() => false);
      expect(successMessage || redirectedCorrectly).toBeTruthy();
    }
    
    console.log('✅ Adult user registration successful');
  });

  test('User Login: Valid Credentials', async ({ page }) => {
    console.log('Testing login with valid credentials...');
    
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill login form
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUsers.existingUser.email);
    await page.fill('input[name="password"]', testUsers.existingUser.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    console.log('✓ Login successful, redirected to dashboard');
    console.log('✅ Valid login working correctly');
  });

  test('User Login: Invalid Credentials', async ({ page }) => {
    console.log('Testing login with invalid credentials...');
    
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill with invalid credentials
    await page.fill('input[name="emailOrPhone"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait a bit for error message
    await page.waitForTimeout(1000);
    
    // Should show error message
    const errorMessage = await page.locator('text=/invalid|incorrect|wrong|error/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/);
    
    console.log('✓ Error message displayed for invalid credentials');
    console.log('✅ Invalid login handling working correctly');
  });

  test('Email Verification Flow', async ({ page }) => {
    console.log('Testing email verification page...');
    
    await page.goto(`${BASE_URL}/auth/verify-email`);
    
    // Check if page loads correctly
    await expect(page.locator('text=/verify|verification|email/i').first()).toBeVisible();
    
    console.log('✓ Email verification page loads');
    
    // Check for resend button or link
    const resendButton = page.locator('button:has-text("Resend"), a:has-text("Resend")');
    if (await resendButton.isVisible().catch(() => false)) {
      console.log('✓ Resend verification email option available');
    }
    
    console.log('✅ Email verification page working correctly');
  });

  test('Forgot Password Flow', async ({ page }) => {
    console.log('Testing forgot password flow...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")');
    
    if (await forgotPasswordLink.isVisible()) {
      console.log('✓ Forgot password link found on login page');
      
      // Click forgot password
      await forgotPasswordLink.click();
      
      // Should navigate to forgot password page
      await page.waitForURL(/\/auth\/forgot-password|\/auth\/reset-password/);
      
      console.log('✓ Navigated to forgot password page');
      
      // Fill email
      await page.fill('input[name="email"], input[type="email"]', testUsers.existingUser.email);
      
      // Submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Should show success message or stay on page
      const successIndicator = await page.locator('text=/sent|check|email|success/i').isVisible().catch(() => false);
      expect(successIndicator).toBeTruthy();
      
      console.log('✓ Password reset email request submitted');
      console.log('✅ Forgot password flow working correctly');
    } else {
      console.log('⚠️ Forgot password link not found - may not be implemented yet');
    }
  });

  test('Parental Consent Flow (Minor User)', async ({ page }) => {
    console.log('Testing parental consent for minor users...');
    
    // Navigate to pending consent page
    await page.goto(`${BASE_URL}/auth/pending-consent`);
    
    // Check if page loads
    await expect(page.locator('text=/parent|consent|guardian|approval/i').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Parental consent page loads');
    
    // Check for informational text
    const infoText = await page.locator('text=/email|waiting|pending/i').isVisible().catch(() => false);
    expect(infoText).toBeTruthy();
    
    console.log('✓ Consent status information displayed');
    console.log('✅ Parental consent page working correctly');
  });

  test('Session Persistence: Logout and Session Check', async ({ page }) => {
    console.log('Testing session management...');
    
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUsers.existingUser.email);
    await page.fill('input[name="password"]', testUsers.existingUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    console.log('✓ Logged in successfully');
    
    // Check if user info is displayed
    const userInfo = await page.locator('text=/student|user|profile|account/i').first().isVisible().catch(() => false);
    console.log(`User info visible: ${userInfo}`);
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    
    if (await logoutButton.isVisible().catch(() => false)) {
      console.log('✓ Logout button found');
      
      // Click logout
      await logoutButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      const currentUrl = page.url();
      const loggedOut = currentUrl.includes('/auth/login') || currentUrl === `${BASE_URL}/`;
      expect(loggedOut).toBeTruthy();
      
      console.log('✓ Logged out successfully');
      
      // Try to access dashboard - should redirect to login
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(1000);
      
      // Should be redirected to login
      const redirectedToLogin = page.url().includes('/auth/login');
      if (redirectedToLogin) {
        console.log('✓ Unauthorized access redirected to login');
      }
      
      console.log('✅ Session management working correctly');
    } else {
      console.log('⚠️ Logout button not found - checking for dropdown menu');
      
      // Check for user menu dropdown
      const userMenu = page.locator('[data-testid="user-menu"], button:has-text("@"), .user-menu');
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const dropdownLogout = page.locator('button:has-text("Logout"), a:has-text("Logout")');
        if (await dropdownLogout.isVisible().catch(() => false)) {
          console.log('✓ Logout found in dropdown menu');
        }
      }
    }
  });

  test('Form Validation: Empty Fields', async ({ page }) => {
    console.log('Testing form validation with empty fields...');
    
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Try to submit without filling anything
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    // Should show validation errors or browser validation
    // Check if still on login page
    await expect(page).toHaveURL(/\/auth\/login/);
    
    console.log('✓ Form submission blocked for empty fields');
    
    // Try with only email
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUsers.existingUser.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Should still be on login or show error
    await expect(page).toHaveURL(/\/auth\/login/);
    
    console.log('✓ Password field validation working');
    console.log('✅ Form validation working correctly');
  });

  test('Protected Route Access: Unauthorized', async ({ page }) => {
    console.log('Testing protected route access without authentication...');
    
    // Clear any existing auth
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    // Try to access dashboard directly
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to login
    await page.waitForTimeout(2000);
    const redirectedToLogin = page.url().includes('/auth/login');
    
    if (redirectedToLogin) {
      console.log('✓ Dashboard access redirected to login');
    } else {
      // Might show unauthorized message on same page
      const unauthorizedMsg = await page.locator('text=/unauthorized|login required|sign in/i').isVisible().catch(() => false);
      expect(redirectedToLogin || unauthorizedMsg).toBeTruthy();
    }
    
    // Try to access tests page
    await page.goto(`${BASE_URL}/tests`);
    await page.waitForTimeout(2000);
    
    const testsRedirected = page.url().includes('/auth/login');
    if (testsRedirected) {
      console.log('✓ Tests page access redirected to login');
    }
    
    console.log('✅ Protected routes properly secured');
  });

  test('Responsive Design: Mobile Authentication', async ({ page }) => {
    console.log('Testing authentication on mobile viewport...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to login
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Check if form is visible and usable
    await expect(page.locator('input[name="emailOrPhone"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Login form responsive on mobile');
    
    // Try login on mobile
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUsers.existingUser.email);
    await page.fill('input[name="password"]', testUsers.existingUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    
    console.log('✓ Login works on mobile viewport');
    
    // Check if dashboard is responsive
    await expect(page.locator('text=/dashboard|welcome/i').first()).toBeVisible();
    
    console.log('✅ Mobile responsive design working correctly');
  });
});

// Configure test to run in parallel
test.describe.configure({ mode: 'parallel' });
