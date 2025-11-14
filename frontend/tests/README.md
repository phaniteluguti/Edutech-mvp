# Frontend Testing Guide

This directory contains end-to-end tests for the EdTech MVP frontend application using Playwright.

## Prerequisites

1. **Install Playwright**:
   ```powershell
   cd frontend
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Ensure Backend is Running**:
   ```powershell
   cd backend
   npm run dev
   ```

3. **Ensure Frontend is Running**:
   ```powershell
   cd frontend
   npm run dev
   ```

## Running Tests

### Run All Tests
```powershell
cd frontend
npx playwright test
```

### Run Phase 6 Tests Only
```powershell
npx playwright test tests/phase6-user-flow.spec.ts
```

### Run Tests in Headed Mode (See Browser)
```powershell
npx playwright test --headed
```

### Run Tests in UI Mode (Interactive)
```powershell
npx playwright test --ui
```

### Run Tests in Debug Mode
```powershell
npx playwright test --debug
```

### Run Tests on Specific Browser
```powershell
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### View Test Report
```powershell
npx playwright show-report
```

## Test Structure

### Phase 6: Mock Test Taking Experience Tests

The `phase6-user-flow.spec.ts` file contains comprehensive tests for:

1. **Complete User Flow Test**
   - Login
   - Navigate to Mock Tests
   - View test list
   - Start a test
   - Answer questions
   - Submit test
   - View results
   - Check test history

2. **Test List Page Test**
   - Filter functionality
   - Test card display
   - Test metadata

3. **Test Taking Page Test**
   - Timer functionality
   - Question navigation
   - Option selection
   - Question palette

4. **Results Page Test**
   - Score display
   - Statistics
   - Question analysis

5. **Error Handling Test**
   - Unauthorized access
   - Redirects

6. **Responsive Design Test**
   - Mobile view
   - Test accessibility on small screens

7. **API Integration Test**
   - Backend communication
   - API calls verification

## Test User Credentials

The tests use the following seeded user:
- **Email**: student@example.com
- **Password**: Password123!

## Expected Test Data

The tests expect:
- 1 mock test (JEE Main Mock Test 1)
- 10 questions in the test
- 300 total marks
- 30 minutes duration

## Test Results

Test results are saved in:
- `test-results/` - Screenshots and videos of failed tests
- `playwright-report/` - HTML report

## Troubleshooting

### Tests Fail with "Element not found"
- Ensure frontend is running on http://localhost:3000
- Ensure backend is running on http://localhost:4000
- Check that database is seeded with test data

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Ensure servers are responding

### API Errors
- Verify backend is running: `curl http://localhost:4000/health`
- Check backend logs for errors
- Verify database is accessible

### Login Fails
- Verify test user exists in database
- Check email is verified
- Verify password is correct

## Best Practices

1. **Run tests in order**: Some tests depend on previous test state
2. **Clean state**: Each test should start with a clean state
3. **Wait for elements**: Use `waitForSelector` instead of fixed timeouts
4. **Check visibility**: Always verify elements are visible before interacting
5. **Handle dynamic content**: Use appropriate selectors for dynamic elements

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Install Playwright
  run: |
    cd frontend
    npm install -D @playwright/test
    npx playwright install --with-deps

- name: Run tests
  run: |
    cd frontend
    npx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: frontend/playwright-report/
```

## Writing New Tests

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add console.log statements for clarity
4. Handle both success and failure cases
5. Clean up test data if needed
6. Use page objects for complex pages
7. Add assertions for critical functionality

## Coverage

Current test coverage includes:
- ✅ Authentication (Login)
- ✅ Test List Page
- ✅ Test Taking Interface
- ✅ Results Page
- ✅ Navigation
- ✅ API Integration
- ✅ Error Handling
- ✅ Responsive Design

Future coverage needed:
- ⏳ Registration flow
- ⏳ Profile management
- ⏳ Performance metrics
- ⏳ Accessibility testing
