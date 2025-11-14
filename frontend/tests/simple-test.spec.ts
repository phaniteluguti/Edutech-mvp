import { test, expect } from '@playwright/test';

test('Simple Phase 6 Test', async ({ page }) => {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('=== Starting Simple Test ===');
  
  // Step 1: Login
  console.log('\n1. Logging in...');
  await page.goto(`${BASE_URL}/auth/login`);
  await page.fill('input[name="emailOrPhone"]', 'student@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
  console.log('   ✓ Logged in');

  // Step 2: Go to tests
  console.log('\n2. Going to tests page...');
  await page.goto(`${BASE_URL}/tests`);
  await page.waitForSelector('text=Mock Tests');
  console.log('   ✓ On tests page');

  // Step 3: Start test
  console.log('\n3. Starting test...');
  const startButton = page.locator('button:has-text("Start Test")').first();
  await startButton.click();
  
  // Wait for navigation
  await page.waitForURL(/\/tests\/.*\/take/, { timeout: 10000 });
  console.log('   ✓ Navigated to test-taking page');
  
  // Step 4: Wait for page to load
  console.log('\n4. Waiting for test page to load...');
  await page.waitForTimeout(3000);
  
  // Check what's on the page
  const bodyText = await page.textContent('body');
  console.log(`   Page text preview: ${bodyText?.substring(0, 200)}...`);
  
  // Look for Question or Error
  const hasQuestion = await page.locator('text=/Question \\d+/').isVisible({ timeout: 2000 }).catch(() => false);
  const hasError = await page.locator('text=Error').isVisible({ timeout: 1000 }).catch(() => false);
  
  if (hasError) {
    const errorMsg = await page.locator('p').filter({ hasText: /prisma|constraint|invalid/i }).textContent().catch(() => '');
    console.log(`   ✗ ERROR FOUND: ${errorMsg}`);
    throw new Error(`Test page shows error: ${errorMsg}`);
  }
  
  if (hasQuestion) {
    console.log('   ✓ Question loaded successfully!');
  } else {
    console.log('   ⚠ No question found but no error either');
  }
  
  console.log('\n=== Test Complete ===');
});
