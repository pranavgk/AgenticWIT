# Test Authentication Flow

Write-Host "`n=== Testing AgenticWIT Authentication ===" -ForegroundColor Cyan
Write-Host ""

# Generate random user to avoid conflicts
$randomId = Get-Random -Minimum 1000 -Maximum 9999
$testEmail = "testuser$randomId@example.com"
$testUsername = "testuser$randomId"

# Test 1: Register a new user
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    email = $testEmail
    username = $testUsername
    password = "SecurePass123!"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✓ User registered successfully!" -ForegroundColor Green
    Write-Host "  User ID: $($registerResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "  Username: $($registerResponse.data.user.username)" -ForegroundColor Gray
    
    $accessToken = $registerResponse.data.tokens.accessToken
    $refreshToken = $registerResponse.data.tokens.refreshToken
    Write-Host "  Access Token: $($accessToken.Substring(0, 50))..." -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $responseBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error: $($responseBody.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get user profile with access token
Write-Host "2. Testing Get Profile (Protected Route)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/me" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✓ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "  Name: $($profileResponse.data.firstName) $($profileResponse.data.lastName)" -ForegroundColor Gray
    Write-Host "  Email: $($profileResponse.data.email)" -ForegroundColor Gray
    Write-Host "  Theme: $($profileResponse.data.theme)" -ForegroundColor Gray
    
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "✗ Get profile failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($errorResponse) {
        Write-Host "  Error: $($errorResponse.error)" -ForegroundColor Red
    }
    Write-Host "  Token (first 50 chars): $($accessToken.Substring(0, [Math]::Min(50, $accessToken.Length)))" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 3: Update user profile
Write-Host "3. Testing Update Profile..." -ForegroundColor Yellow
$updateBody = @{
    firstName = "Jane"
    theme = "dark"
    fontSize = "large"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/me" `
        -Method Patch `
        -Headers $headers `
        -Body $updateBody `
        -ContentType "application/json"
    
    Write-Host "✓ Profile updated successfully!" -ForegroundColor Green
    Write-Host "  New Name: $($updateResponse.data.firstName)" -ForegroundColor Gray
    Write-Host "  New Theme: $($updateResponse.data.theme)" -ForegroundColor Gray
    Write-Host "  New Font Size: $($updateResponse.data.fontSize)" -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Update profile failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Login with credentials
Write-Host "4. Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.data.user.username)" -ForegroundColor Gray
    Write-Host "  New Access Token received" -ForegroundColor Gray
    
    $newAccessToken = $loginResponse.data.tokens.accessToken
    $newRefreshToken = $loginResponse.data.tokens.refreshToken
    
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 5: Refresh token
Write-Host "5. Testing Token Refresh..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $newRefreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/refresh" `
        -Method Post `
        -Body $refreshBody `
        -ContentType "application/json"
    
    Write-Host "✓ Token refreshed successfully!" -ForegroundColor Green
    Write-Host "  New tokens generated" -ForegroundColor Gray
    
    $finalAccessToken = $refreshResponse.data.tokens.accessToken
    $finalRefreshToken = $refreshResponse.data.tokens.refreshToken
    
} catch {
    Write-Host "✗ Token refresh failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 6: Logout
Write-Host "6. Testing Logout..." -ForegroundColor Yellow
$logoutBody = @{
    refreshToken = $finalRefreshToken
} | ConvertTo-Json

try {
    $logoutHeaders = @{
        "Authorization" = "Bearer $finalAccessToken"
    }
    
    $logoutResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/logout" `
        -Method Post `
        -Headers $logoutHeaders `
        -Body $logoutBody `
        -ContentType "application/json"
    
    Write-Host "✓ Logout successful!" -ForegroundColor Green
    Write-Host "  Message: $($logoutResponse.message)" -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Authentication system is fully functional:" -ForegroundColor Cyan
Write-Host "✓ User registration" -ForegroundColor Green
Write-Host "✓ User login" -ForegroundColor Green
Write-Host "✓ Profile retrieval" -ForegroundColor Green
Write-Host "✓ Profile updates" -ForegroundColor Green
Write-Host "✓ Token refresh" -ForegroundColor Green
Write-Host "✓ User logout" -ForegroundColor Green
Write-Host ""
