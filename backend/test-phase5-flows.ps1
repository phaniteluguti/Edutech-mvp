Write-Host "`n=== PHASE 5 ADDITIONAL USER FLOW TESTS ===`n" -ForegroundColor Cyan

# Get admin token
Write-Host "1. Getting admin token..." -ForegroundColor Yellow
$loginData = '{"emailOrPhone":"admin@edutech.com","password":"Password123!"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" -Method Post -Body $loginData -ContentType 'application/json'
$adminToken = $loginResponse.data.token
$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}
Write-Host "   ✓ Admin token received`n" -ForegroundColor Green

# Test 1: Slug-based exam access
Write-Host "2. Testing slug-based exam access..." -ForegroundColor Yellow
try {
    $slugResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams/slug/jee-main" -Method Get
    Write-Host "   ✓ SUCCESS: Retrieved $($slugResponse.data.name)" -ForegroundColor Green
}
catch {
    Write-Host "   ✗ FAILED" -ForegroundColor Red
}

# Test 2: Verify inactive exam hidden from public
Write-Host "`n3. Verifying inactive exam is hidden from public..." -ForegroundColor Yellow
$publicExams = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams" -Method Get
$catExam = $publicExams.data | Where-Object { $_.slug -eq 'cat' }
if ($null -eq $catExam) {
    Write-Host "   ✓ SUCCESS: Inactive CAT exam is hidden from public" -ForegroundColor Green
}
else {
    Write-Host "   ✗ FAILED: Inactive exam should not be visible" -ForegroundColor Red
}

# Test 3: Verify admin CAN see inactive exam
Write-Host "`n4. Verifying admin can see inactive exam..." -ForegroundColor Yellow
$adminExams = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Get -Headers $headers
$catExamAdmin = $adminExams.data | Where-Object { $_.slug -eq 'cat' }
if ($null -ne $catExamAdmin) {
    Write-Host "   ✓ SUCCESS: Admin can see inactive CAT exam (isActive=$($catExamAdmin.isActive))" -ForegroundColor Green
}
else {
    Write-Host "   ✗ FAILED: Admin should see inactive exams" -ForegroundColor Red
}

# Test 4: Duplicate slug prevention
Write-Host "`n5. Testing duplicate slug prevention..." -ForegroundColor Yellow
$duplicateExam = '{"name":"Test Duplicate","slug":"jee-main","description":"Should fail","duration":180,"totalMarks":300,"negativeMarking":true,"syllabus":{},"pattern":{}}'
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $duplicateExam -ErrorAction Stop
    Write-Host "   ✗ FAILED: Should have returned 409 conflict" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "   ✓ SUCCESS: Correctly prevented duplicate slug (409)" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ FAILED: Wrong error code" -ForegroundColor Red
    }
}

# Test 5: Validation for missing fields
Write-Host "`n6. Testing validation for missing fields..." -ForegroundColor Yellow
$invalidExam = '{"name":"Invalid Exam"}'
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $invalidExam -ErrorAction Stop
    Write-Host "   ✗ FAILED: Should have returned 400 validation error" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   ✓ SUCCESS: Correctly rejected invalid data (400)" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ FAILED: Wrong error code" -ForegroundColor Red
    }
}

# Test 6: Update exam
Write-Host "`n7. Testing exam update..." -ForegroundColor Yellow
$jeeExam = $adminExams.data | Where-Object { $_.slug -eq 'jee-main' }
$updateData = @{
    name = "JEE Main 2025 (Updated)"
    slug = "jee-main"
    description = $jeeExam.description
    duration = $jeeExam.duration
    totalMarks = $jeeExam.totalMarks
    negativeMarking = $jeeExam.negativeMarking
    syllabus = $jeeExam.syllabus
    pattern = $jeeExam.pattern
    isActive = $jeeExam.isActive
} | ConvertTo-Json -Depth 10

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$($jeeExam.id)" -Method Put -Headers $headers -Body $updateData
    Write-Host "   ✓ SUCCESS: Updated to '$($updateResponse.data.name)'" -ForegroundColor Green
    
    # Revert
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
    } | ConvertTo-Json -Depth 10
    
    Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$($jeeExam.id)" -Method Put -Headers $headers -Body $revertData | Out-Null
    Write-Host "   ✓ Reverted changes" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Soft delete
Write-Host "`n8. Testing soft delete..." -ForegroundColor Yellow
$testExam = '{"name":"Test Exam to Delete","slug":"test-delete-exam","description":"Will be deleted","duration":60,"totalMarks":100,"negativeMarking":false,"syllabus":{},"pattern":{}}'
try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Post -Headers $headers -Body $testExam
    $testExamId = $createResponse.data.id
    
    # Delete it
    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams/$testExamId" -Method Delete -Headers $headers
    Write-Host "   ✓ SUCCESS: Soft deleted (isActive=$($deleteResponse.data.isActive))" -ForegroundColor Green
    
    # Verify not in public list
    $publicExamsAfter = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/exams" -Method Get
    $deletedInPublic = $publicExamsAfter.data | Where-Object { $_.id -eq $testExamId }
    if ($null -eq $deletedInPublic) {
        Write-Host "   ✓ Confirmed: Not in public list" -ForegroundColor Green
    }
    
    # Verify admin CAN see it
    $adminExamsAfter = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/admin/exams" -Method Get -Headers $headers
    $deletedInAdmin = $adminExamsAfter.data | Where-Object { $_.id -eq $testExamId }
    if ($null -ne $deletedInAdmin) {
        Write-Host "   ✓ Confirmed: Admin can still see it" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ALL ADDITIONAL TESTS COMPLETE ===`n" -ForegroundColor Cyan
