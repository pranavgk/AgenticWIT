# AgenticWIT Backend - Quick Test Script

Write-Host "Testing AgenticWIT Backend API..." -ForegroundColor Cyan
Write-Host ""

# Test Health Endpoint
Write-Host "1. Testing /health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host "  Environment: $($health.environment)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test API Info Endpoint
Write-Host "2. Testing /api endpoint..." -ForegroundColor Yellow
try {
    $api = Invoke-RestMethod -Uri "http://localhost:3001/api" -Method Get
    Write-Host "✓ API info retrieved" -ForegroundColor Green
    Write-Host "  Name: $($api.name)" -ForegroundColor Gray
    Write-Host "  Version: $($api.version)" -ForegroundColor Gray
    Write-Host "  Endpoints: $($api.endpoints.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "✗ API info failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test User Registration (should fail without database)
Write-Host "3. Testing /api/auth/register endpoint..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "test@example.com"
        username = "testuser"
        password = "Test123!@#"
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✓ Registration endpoint accessible" -ForegroundColor Green
    Write-Host "  Response: $($register.success)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Registration endpoint exists (expected error without DB)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
