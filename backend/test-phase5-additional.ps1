Write-Host "`n=== PHASE 5 ADDITIONAL USER FLOW TESTS ===`n" -ForegroundColor Cyan

# Get admin token first
Write-Host "1. Getting admin token..." -ForegroundColor Yellow
$loginData = @{
    emailOrPhone = 'admin@edutech.com'
    password = 'Password123!'
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" -Method Post -Body $loginData -ContentType 'application/json'
$adminToken = $loginResponse.data.token
Write-Host "   ✓ Admin token received`n" -ForegroundColor Green

# Test 1: Slug-based exam access
Write-Host "2. Testing slug-based exam access (GET /api/v1/exams/slug/jee-main)..." -ForegroundColor Yellow
try {
    $slugResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams/slug/jee-main" -Method Get
    Write-Host "   ✓ SUCCESS: Retrieved exam by slug" -ForegroundColor Green
    Write-Host "   Exam: $($slugResponse.data.name)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Non-existent slug (should 404)
Write-Host "`n3. Testing non-existent slug (should fail with 404)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams/slug/non-existent-exam" -Method Get -ErrorAction Stop
    Write-Host "   ✗ FAILED: Should have returned 404" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "   ✓ SUCCESS: Correctly returned 404 for non-existent slug" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ FAILED: Wrong error code: $statusCode" -ForegroundColor Red
    }
}

# Test 3: Verify inactive exam (CAT) not in public list
Write-Host "`n4. Verifying inactive exam is hidden from public..." -ForegroundColor Yellow
$publicExams = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams" -Method Get
$catExam = $publicExams.data | Where-Object { $_.slug -eq 'cat' }
if ($null -eq $catExam) {
    Write-Host "   ✓ SUCCESS: Inactive CAT exam is hidden from public" -ForegroundColor Green
} else {
    Write-Host "   ✗ FAILED: Inactive exam should not be visible" -ForegroundColor Red
}

# Test 4: Verify inactive exam IS visible to admin
Write-Host "`n5. Verifying inactive exam is visible to admin..." -ForegroundColor Yellow
$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}
$adminExams = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Get -Headers $headers
$catExamAdmin = $adminExams.data | Where-Object { $_.slug -eq 'cat' }
if ($null -ne $catExamAdmin) {
    Write-Host "   ✓ SUCCESS: Inactive CAT exam is visible to admin" -ForegroundColor Green
    Write-Host "   Status: isActive=$($catExamAdmin.isActive)" -ForegroundColor Gray
} else {
    Write-Host "   ✗ FAILED: Admin should see inactive exams" -ForegroundColor Red
}

# Test 5: Try creating exam with duplicate slug (should fail with 409)
Write-Host "`n6. Testing duplicate slug prevention (should fail with 409)..." -ForegroundColor Yellow
$duplicateExam = @{
    name = "Test Duplicate"
    slug = "jee-main"  # Already exists
    description = "This should fail"
    duration = 180
    totalMarks = 300
    negativeMarking = $true
    syllabus = @{}
    pattern = @{}
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $duplicateExam -ErrorAction Stop
    Write-Host "   ✗ FAILED: Should have returned 409 conflict" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "   ✓ SUCCESS: Correctly prevented duplicate slug (409)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ FAILED: Wrong error code: $statusCode" -ForegroundColor Red
    }
}

# Test 6: Try creating exam with missing fields (should fail with 400)
Write-Host "`n7. Testing validation for missing fields (should fail with 400)..." -ForegroundColor Yellow
$invalidExam = @{
    name = "Invalid Exam"
    # Missing slug, duration, etc.
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $invalidExam -ErrorAction Stop
    Write-Host "   ✗ FAILED: Should have returned 400 validation error" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "   ✓ SUCCESS: Correctly rejected invalid data (400)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ FAILED: Wrong error code: $statusCode" -ForegroundColor Red
    }
}

# Test 7: Update an exam
Write-Host "`n8. Testing exam update (PUT /api/v1/admin/exams/:id)..." -ForegroundColor Yellow
$jeeExam = $adminExams.data | Where-Object { $_.slug -eq 'jee-main' }
if ($jeeExam) {
    $updateData = @{
        name = "JEE Main 2025 (Updated)"
        slug = "jee-main"
        description = "Updated description for testing"
        duration = $jeeExam.duration
        totalMarks = $jeeExam.totalMarks
        negativeMarking = $jeeExam.negativeMarking
        syllabus = $jeeExam.syllabus
        pattern = $jeeExam.pattern
        isActive = $jeeExam.isActive
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$($jeeExam.id)" -Method Put -Headers $headers -Body $updateData
        Write-Host "   ✓ SUCCESS: Exam updated" -ForegroundColor Green
        Write-Host "   New name: $($updateResponse.data.name)" -ForegroundColor Gray
        
        # Revert the change
        $revertData = @{
            name = "JEE Main Mock Test"
            slug = "jee-main"
            description = $jeeExam.description
            duration = $jeeExam.duration
            totalMarks = $jeeExam.totalMarks
            negativeMarking = $jeeExam.negativeMarking
            syllabus = $jeeExam.syllabus
            pattern = $jeeExam.pattern
            isActive = $jeeExam.isActive
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$($jeeExam.id)" -Method Put -Headers $headers -Body $revertData | Out-Null
        Write-Host "   ✓ Reverted changes" -ForegroundColor Gray
    } catch {
        Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Soft delete an exam
Write-Host "`n9. Testing soft delete (DELETE /api/v1/admin/exams/:id)..." -ForegroundColor Yellow
# First create a test exam to delete
$testExam = @{
    name = "Test Exam to Delete"
    slug = "test-delete-exam"
    description = "This will be deleted"
    duration = 60
    totalMarks = 100
    negativeMarking = $false
    syllabus = @{}
    pattern = @{}
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $testExam
    $testExamId = $createResponse.data.id
    Write-Host "   Created test exam: $testExamId" -ForegroundColor Gray
    
    # Now delete it
    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$testExamId" -Method Delete -Headers $headers
    Write-Host "   ✓ SUCCESS: Exam soft deleted" -ForegroundColor Green
    Write-Host "   isActive: $($deleteResponse.data.isActive)" -ForegroundColor Gray
    
    # Verify it's not in public list
    $publicExamsAfter = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams" -Method Get
    $deletedInPublic = $publicExamsAfter.data | Where-Object { $_.id -eq $testExamId }
    if ($null -eq $deletedInPublic) {
        Write-Host "   ✓ Confirmed: Deleted exam not in public list" -ForegroundColor Green
    } else {
        Write-Host "   ✗ FAILED: Deleted exam should not be public" -ForegroundColor Red
    }
    
    # Verify admin can still see it
    $adminExamsAfter = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Get -Headers $headers
    $deletedInAdmin = $adminExamsAfter.data | Where-Object { $_.id -eq $testExamId }
    if ($null -ne $deletedInAdmin) {
        Write-Host "   ✓ Confirmed: Admin can still see deleted exam" -ForegroundColor Green
    } else {
        Write-Host "   ✗ FAILED: Admin should see deleted exams" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ADDITIONAL TESTS COMPLETE ===`n" -ForegroundColor Cyan
