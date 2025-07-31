# Docker Hub Troubleshooting Script for Windows
Write-Host "=== Docker Hub Troubleshooting Script ===" -ForegroundColor Green
Write-Host ""

# Check Docker installation
Write-Host "1. Checking Docker installation..." -ForegroundColor Yellow
try {
    docker --version
    docker info | Select-Object -First 10
} catch {
    Write-Host "Docker not found or not accessible" -ForegroundColor Red
}
Write-Host ""

# Check Docker Hub connectivity
Write-Host "2. Testing Docker Hub connectivity..." -ForegroundColor Yellow
try {
    Test-NetConnection -ComputerName "registry-1.docker.io" -Port 443
} catch {
    Write-Host "Cannot connect to Docker Hub registry" -ForegroundColor Red
}
Write-Host ""

# Check if we can search Docker Hub
Write-Host "3. Testing Docker Hub search..." -ForegroundColor Yellow
try {
    docker search hello-world --limit 1
} catch {
    Write-Host "Docker Hub search failed" -ForegroundColor Red
}
Write-Host ""

# Check Docker Hub credentials (if available)
Write-Host "4. Checking Docker Hub credentials..." -ForegroundColor Yellow
if ($env:DOCKER_USERNAME -and $env:DOCKER_PASSWORD) {
    Write-Host "Docker credentials are set"
    Write-Host "Username: $env:DOCKER_USERNAME"
    Write-Host "Password: [HIDDEN]"
    
    # Test login
    Write-Host "Testing Docker Hub login..."
    try {
        $env:DOCKER_PASSWORD | docker login -u $env:DOCKER_USERNAME --password-stdin
    } catch {
        Write-Host "Docker Hub login failed" -ForegroundColor Red
    }
    Write-Host ""
    
    # Check login status
    Write-Host "Checking login status..."
    try {
        docker login --get-login
    } catch {
        Write-Host "Not logged into Docker Hub" -ForegroundColor Yellow
    }
} else {
    Write-Host "Docker credentials not set in environment" -ForegroundColor Yellow
    Write-Host "Please set DOCKER_USERNAME and DOCKER_PASSWORD environment variables"
}
Write-Host ""

# Check Docker images
Write-Host "5. Checking local Docker images..." -ForegroundColor Yellow
try {
    docker images
} catch {
    Write-Host "Failed to list Docker images" -ForegroundColor Red
}
Write-Host ""

# Check Docker Hub rate limits (if logged in)
Write-Host "6. Checking Docker Hub rate limits..." -ForegroundColor Yellow
try {
    $loginStatus = docker login --get-login 2>$null
    if ($loginStatus) {
        Write-Host "Logged into Docker Hub" -ForegroundColor Green
        Write-Host "Note: Free Docker Hub accounts have rate limits" -ForegroundColor Yellow
        Write-Host "- 200 pulls per 6 hours for anonymous users"
        Write-Host "- 200 pulls per 6 hours for free authenticated users"
        Write-Host "- 5000 pulls per 6 hours for Pro users"
    } else {
        Write-Host "Not logged into Docker Hub" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Not logged into Docker Hub" -ForegroundColor Yellow
}
Write-Host ""

# Test pushing a small image
Write-Host "7. Testing Docker Hub push with a small image..." -ForegroundColor Yellow
try {
    docker pull hello-world
    docker tag hello-world test-push:latest
    Write-Host "Attempting to push test image..."
    docker push test-push:latest
    docker rmi test-push:latest hello-world
} catch {
    Write-Host "Push test failed - this is expected for test purposes" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Troubleshooting Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Common issues and solutions:" -ForegroundColor Cyan
Write-Host "1. Docker Hub credentials not configured in Jenkins"
Write-Host "   - Go to Jenkins > Manage Jenkins > Credentials"
Write-Host "   - Add new credentials with ID 'docker-hub-credentials'"
Write-Host "   - Use Username/Password type"
Write-Host ""
Write-Host "2. Docker Hub rate limits"
Write-Host "   - Free accounts have limits on pulls and pushes"
Write-Host "   - Consider upgrading to Pro account for production"
Write-Host ""
Write-Host "3. Network connectivity"
Write-Host "   - Check firewall settings"
Write-Host "   - Verify DNS resolution"
Write-Host "   - Test with: Test-NetConnection registry-1.docker.io -Port 443"
Write-Host ""
Write-Host "4. Repository permissions"
Write-Host "   - Ensure the repository exists on Docker Hub"
Write-Host "   - Verify you have push permissions"
Write-Host "   - Check repository name matches Jenkinsfile"
Write-Host ""
Write-Host "5. Security issues"
Write-Host "   - Use Docker Hub Access Tokens instead of passwords"
Write-Host "   - Avoid string interpolation in Jenkinsfile"
Write-Host "   - Use withCredentials block properly" 