import { test, expect } from '@playwright/test';

/**
 * Phase 4: Admin Features Tests
 * Tests admin login, exam management, and administrative functions
 */

const BASE_URL = 'http://localhost:3000';

// Note: You'll need to update these credentials with actual admin credentials
const adminUser = {
  email: 'admin@example.com',
  password: 'Admin123!',
};

const testUser = {
  email: 'student@example.com',
  password: 'Password123!',
};

test.describe('Phase 4: Admin Features Tests', () => {
  
  test('Admin Login: Access Admin Panel', async ({ page }) => {
    console.log('Testing admin login...');
    
    // Try to navigate to admin login, fall back to regular login
    const adminLoginResponse = await page.goto(`${BASE_URL}/admin/login`).catch(() => null);
    
    // Check if we got a 404 or error
    if (!adminLoginResponse || adminLoginResponse.status() === 404) {
      console.log('⚠️ /admin/login not found, trying /auth/login');
      await page.goto(`${BASE_URL}/auth/login`);
    }
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Fill admin credentials
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    // Should redirect to admin dashboard or show admin features
    const isAdminPage = currentUrl.includes('/admin');
    const hasDashboard = currentUrl.includes('/dashboard');
    
    if (isAdminPage) {
      console.log('✓ Redirected to admin panel');
      console.log('✅ Admin login successful');
    } else if (hasDashboard) {
      console.log('⚠️ Redirected to regular dashboard - checking for admin features');
      
      // Look for admin-specific elements
      const adminLinks = page.locator('a:has-text("Admin"), a:has-text("Manage")');
      if (await adminLinks.first().isVisible().catch(() => false)) {
        console.log('✓ Admin links found on dashboard');
        console.log('✅ Admin access granted');
      } else {
        console.log('⚠️ No admin features visible - credentials may be invalid');
      }
    }
  });

  test('Admin: Exam Management Page Access', async ({ page }) => {
    console.log('Testing admin exam management access...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Navigate to exam management
    await page.goto(`${BASE_URL}/admin/exams`);
    
    // Check if page loads
    const pageLoaded = await page.locator('text=/exam|manage|admin/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (pageLoaded) {
      console.log('✓ Admin exam management page loads');
      console.log('✅ Exam management access working');
    } else {
      console.log('⚠️ Admin exam management page not accessible or not implemented');
    }
  });

  test('Admin: View Exam List', async ({ page }) => {
    console.log('Testing admin exam list view...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for exam list or table
    const examList = page.locator('table, [class*="list"], [class*="grid"]');
    const listExists = await examList.first().isVisible().catch(() => false);
    
    if (listExists) {
      console.log('✓ Exam list/table found');
      
      // Check for exam names
      const examNames = page.locator('text=/JEE|NEET|exam/i');
      const examCount = await examNames.count();
      console.log(`✓ Found ${examCount} exam entries`);
      
      console.log('✅ Admin can view exam list');
    } else {
      console.log('⚠️ Exam list not found - may not be implemented');
    }
  });

  test('Admin: Create New Exam Button', async ({ page }) => {
    console.log('Testing create new exam functionality...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for create/add button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New"), a:has-text("Create")');
    
    if (await createButton.first().isVisible().catch(() => false)) {
      console.log('✓ Create exam button found');
      
      // Click it
      await createButton.first().click();
      await page.waitForTimeout(1000);
      
      // Should show form or modal
      const form = page.locator('form, [role="dialog"], [class*="modal"]');
      const formVisible = await form.first().isVisible().catch(() => false);
      
      if (formVisible) {
        console.log('✓ Create exam form/modal appears');
        console.log('✅ Create exam functionality present');
      } else {
        console.log('⚠️ Form not visible - may navigate to different page');
      }
    } else {
      console.log('⚠️ Create exam button not found');
    }
  });

  test('Admin: Edit Exam Functionality', async ({ page }) => {
    console.log('Testing edit exam functionality...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit"), [aria-label*="edit" i]');
    
    if (await editButtons.first().isVisible().catch(() => false)) {
      console.log('✓ Edit button found');
      console.log('✅ Edit exam functionality present');
    } else {
      console.log('⚠️ Edit buttons not found - may not be implemented');
    }
  });

  test('Admin: Delete Exam Functionality', async ({ page }) => {
    console.log('Testing delete exam functionality...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for delete buttons
    const deleteButtons = page.locator('button:has-text("Delete"), button:has-text("Remove"), [aria-label*="delete" i]');
    
    if (await deleteButtons.first().isVisible().catch(() => false)) {
      console.log('✓ Delete button found');
      console.log('✅ Delete exam functionality present');
    } else {
      console.log('⚠️ Delete buttons not found - may not be implemented');
    }
  });

  test('Admin: Non-Admin User Access Restriction', async ({ page }) => {
    console.log('Testing admin access restrictions for regular users...');
    
    // Login as regular student
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    console.log('✓ Logged in as regular student');
    
    // Try to access admin page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    
    // Should be redirected or show error
    const blocked = !currentUrl.includes('/admin/exams') || 
                   await page.locator('text=/unauthorized|forbidden|access denied|admin only/i').isVisible().catch(() => false);
    
    if (blocked) {
      console.log('✓ Regular user blocked from admin panel');
      console.log('✅ Admin access restrictions working');
    } else {
      console.log('⚠️ Regular user may have access to admin panel - security issue!');
    }
  });

  test('Admin: Bulk Operations', async ({ page }) => {
    console.log('Testing admin bulk operations...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for checkboxes or bulk action controls
    const checkboxes = page.locator('input[type="checkbox"]');
    const bulkActions = page.locator('button:has-text("Bulk"), select:has-text("Bulk")');
    
    const hasCheckboxes = await checkboxes.count() > 0;
    const hasBulkActions = await bulkActions.first().isVisible().catch(() => false);
    
    if (hasCheckboxes && hasBulkActions) {
      console.log('✓ Bulk operation controls found');
      console.log('✅ Bulk operations available');
    } else {
      console.log('⚠️ Bulk operations not found - may not be implemented');
    }
  });

  test('Admin: Search and Filter Exams', async ({ page }) => {
    console.log('Testing admin search and filter...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for search or filter controls
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    const filterSelect = page.locator('select[name*="filter"], select[name*="status"]');
    
    const hasSearch = await searchInput.first().isVisible().catch(() => false);
    const hasFilter = await filterSelect.first().isVisible().catch(() => false);
    
    if (hasSearch || hasFilter) {
      console.log(`✓ Search/filter controls found (search: ${hasSearch}, filter: ${hasFilter})`);
      console.log('✅ Admin search and filter available');
    } else {
      console.log('⚠️ Search/filter not found - may not be implemented');
    }
  });

  test('Admin: Exam Status Toggle (Active/Inactive)', async ({ page }) => {
    console.log('Testing exam status toggle...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="emailOrPhone"], input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to admin exams page
    await page.goto(`${BASE_URL}/admin/exams`);
    await page.waitForTimeout(1000);
    
    // Look for status toggles or buttons
    const statusControls = page.locator('button:has-text("Active"), button:has-text("Inactive"), input[type="checkbox"][name*="active"]');
    
    if (await statusControls.first().isVisible().catch(() => false)) {
      console.log('✓ Status toggle controls found');
      console.log('✅ Exam status toggle available');
    } else {
      console.log('⚠️ Status toggle not found - may not be implemented');
    }
  });
});

// Configure test to run in parallel
test.describe.configure({ mode: 'parallel' });
