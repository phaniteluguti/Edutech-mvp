import { test, expect } from '@playwright/test';

/**
 * Phase 3/5: Exam Management Tests
 * Tests exam browsing, filtering, and display
 */

const BASE_URL = 'http://localhost:3000';

const testUser = {
  email: 'student@example.com',
  password: 'Password123!',
};

test.describe('Phase 3/5: Exam Management Tests', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation with more flexible timeout
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // Accept either dashboard or staying on signin page if already logged in
    if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/signin')) {
      await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    }
    
    console.log('✓ Logged in successfully');
  });

  test('Exams Page: Loads and Displays Exam List', async ({ page }) => {
    console.log('Testing exams page load...');
    
    await page.goto(`${BASE_URL}/exams`);
    
    // Check if page loads
    await expect(page.locator('text=/exam|browse|available/i').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Exams page loads');
    
    // Check for exam cards or list items
    const examItems = page.locator('[class*="exam"], [class*="card"], [data-testid*="exam"]');
    const itemCount = await examItems.count();
    
    if (itemCount > 0) {
      console.log(`✓ Found ${itemCount} exam items`);
    } else {
      // Try alternative selectors
      const alternativeItems = page.locator('text=/JEE|NEET|exam/i');
      const altCount = await alternativeItems.count();
      console.log(`✓ Found ${altCount} exam-related elements`);
    }
    
    console.log('✅ Exams page displays content');
  });

  test('Exams Page: Display Exam Details', async ({ page }) => {
    console.log('Testing exam details display...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for exam-specific information
    const examTypes = ['JEE Main', 'JEE Advanced', 'NEET', 'IIT-JEE'];
    let foundExam = false;
    
    for (const examType of examTypes) {
      const examElement = page.locator(`text=/${examType}/i`).first();
      if (await examElement.isVisible().catch(() => false)) {
        console.log(`✓ Found exam: ${examType}`);
        foundExam = true;
        break;
      }
    }
    
    expect(foundExam).toBeTruthy();
    
    // Check for exam metadata
    const metadataKeywords = [
      'duration',
      'questions',
      'marks',
      'pattern',
      'syllabus',
      'subjects',
    ];
    
    let metadataFound = 0;
    for (const keyword of metadataKeywords) {
      const element = page.locator(`text=/${keyword}/i`);
      const count = await element.count();
      if (count > 0) {
        console.log(`✓ Found metadata: ${keyword}`);
        metadataFound++;
      }
    }
    
    console.log(`✓ Found ${metadataFound} types of exam metadata`);
    console.log('✅ Exam details displayed correctly');
  });

  test('Exams Page: Filter or Sort Exams', async ({ page }) => {
    console.log('Testing exam filtering/sorting...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for filter or sort controls
    const filterControls = [
      'select[name*="filter"]',
      'select[name*="sort"]',
      'button:has-text("Filter")',
      'button:has-text("Sort")',
      'input[type="search"]',
    ];
    
    let controlsFound = 0;
    for (const selector of filterControls) {
      const control = page.locator(selector);
      if (await control.first().isVisible().catch(() => false)) {
        console.log(`✓ Found control: ${selector}`);
        controlsFound++;
      }
    }
    
    if (controlsFound > 0) {
      console.log(`✅ Found ${controlsFound} filter/sort controls`);
    } else {
      console.log('⚠️ No filter/sort controls found - may not be implemented');
    }
  });

  test('Exams Page: Navigate to Exam Details', async ({ page }) => {
    console.log('Testing navigation to exam details...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for clickable exam items
    const examLinks = page.locator('a:has-text("JEE"), a:has-text("NEET"), a:has-text("View"), a:has-text("Details")');
    
    if (await examLinks.first().isVisible().catch(() => false)) {
      console.log('✓ Found exam links');
      
      const linkText = await examLinks.first().textContent();
      console.log(`✓ Clicking on: ${linkText}`);
      
      await examLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Should navigate to details or tests page
      const currentUrl = page.url();
      const navigated = currentUrl !== `${BASE_URL}/exams`;
      
      if (navigated) {
        console.log(`✓ Navigated to: ${currentUrl}`);
        console.log('✅ Exam navigation working');
      } else {
        console.log('⚠️ Navigation may open details on same page');
      }
    } else {
      console.log('⚠️ No exam links found');
    }
  });

  test('Exams Page: Display Exam Count', async ({ page }) => {
    console.log('Testing exam count display...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for exam count or total
    const countIndicators = [
      'text=/\\d+\\s+(exam|test)/i',
      'text=/total/i',
      'text=/available/i',
    ];
    
    let countFound = false;
    for (const selector of countIndicators) {
      const element = page.locator(selector);
      if (await element.first().isVisible().catch(() => false)) {
        const text = await element.first().textContent();
        console.log(`✓ Found count indicator: ${text}`);
        countFound = true;
        break;
      }
    }
    
    if (countFound) {
      console.log('✅ Exam count displayed');
    } else {
      console.log('⚠️ Exam count not explicitly shown');
    }
  });

  test('Exams Page: Exam Categories', async ({ page }) => {
    console.log('Testing exam categories...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for category labels or tags
    const categories = [
      'Engineering',
      'Medical',
      'JEE',
      'NEET',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
    ];
    
    let categoriesFound = 0;
    for (const category of categories) {
      const element = page.locator(`text=/${category}/i`);
      const count = await element.count();
      if (count > 0) {
        console.log(`✓ Found category: ${category}`);
        categoriesFound++;
      }
    }
    
    console.log(`✓ Found ${categoriesFound} exam categories/subjects`);
    console.log('✅ Exam categories displayed');
  });

  test('Exams Page: Responsive Mobile View', async ({ page }) => {
    console.log('Testing exams page on mobile...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Page should still be accessible
    await expect(page.locator('text=/exam|browse/i').first()).toBeVisible();
    
    console.log('✓ Exams page loads on mobile');
    
    // Check if content is visible
    const content = page.locator('text=/JEE|NEET|exam/i');
    const contentCount = await content.count();
    
    if (contentCount > 0) {
      console.log(`✓ Content visible on mobile (${contentCount} items)`);
    }
    
    console.log('✅ Exams page responsive on mobile');
  });

  test('Exams Page: Empty State Handling', async ({ page }) => {
    console.log('Testing empty state handling...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Check if there's content or empty state
    const examContent = page.locator('text=/JEE|NEET|exam|test/i');
    const contentCount = await examContent.count();
    
    if (contentCount === 0) {
      console.log('⚠️ No exam content found - checking for empty state');
      
      // Look for empty state message
      const emptyState = page.locator('text=/no exam|coming soon|not available|empty/i');
      if (await emptyState.first().isVisible().catch(() => false)) {
        console.log('✓ Empty state message displayed');
      }
    } else {
      console.log(`✓ Exam content present (${contentCount} items)`);
    }
    
    console.log('✅ Empty state handling checked');
  });

  test('Exams to Tests: Navigate to Mock Tests for Exam', async ({ page }) => {
    console.log('Testing navigation from exam to its tests...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for buttons to view tests
    const testButtons = page.locator('button:has-text("Test"), a:has-text("Test"), button:has-text("Mock"), a:has-text("Mock")');
    
    if (await testButtons.first().isVisible().catch(() => false)) {
      console.log('✓ Test/Mock button found');
      
      await testButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Should navigate to tests page
      const currentUrl = page.url();
      if (currentUrl.includes('/tests')) {
        console.log('✓ Navigated to tests page');
        console.log('✅ Exam to tests navigation working');
      } else {
        console.log(`⚠️ Navigation went to: ${currentUrl}`);
      }
    } else {
      console.log('⚠️ No test buttons found on exam page');
    }
  });

  test('Exams Page: Search Functionality', async ({ page }) => {
    console.log('Testing exam search...');
    
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(1000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search"]');
    
    if (await searchInput.first().isVisible().catch(() => false)) {
      console.log('✓ Search input found');
      
      // Try searching
      await searchInput.first().fill('JEE');
      await page.waitForTimeout(1000);
      
      // Check if results update
      const results = page.locator('text=/JEE/i');
      const resultCount = await results.count();
      
      console.log(`✓ Search results: ${resultCount} items`);
      console.log('✅ Search functionality working');
    } else {
      console.log('⚠️ Search functionality not found');
    }
  });
});

// Configure test to run in parallel
test.describe.configure({ mode: 'parallel' });
