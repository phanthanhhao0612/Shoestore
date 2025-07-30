#!/bin/bash

echo "=== Docker Hub Troubleshooting Script ==="
echo ""

# Check Docker installation
echo "1. Checking Docker installation..."
docker --version
docker info | head -10
echo ""

# Check Docker Hub connectivity
echo "2. Testing Docker Hub connectivity..."
ping -c 3 registry-1.docker.io
echo ""

# Check if we can search Docker Hub
echo "3. Testing Docker Hub search..."
docker search hello-world --limit 1
echo ""

# Check Docker Hub credentials (if available)
echo "4. Checking Docker Hub credentials..."
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    echo "Docker credentials are set"
    echo "Username: $DOCKER_USERNAME"
    echo "Password: [HIDDEN]"
    
    # Test login
    echo "Testing Docker Hub login..."
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    echo ""
    
    # Check login status
    echo "Checking login status..."
    docker login --get-login
    echo ""
else
    echo "Docker credentials not set in environment"
    echo "Please set DOCKER_USERNAME and DOCKER_PASSWORD environment variables"
fi

# Check Docker images
echo "5. Checking local Docker images..."
docker images
echo ""

# Check Docker Hub rate limits (if logged in)
echo "6. Checking Docker Hub rate limits..."
if docker login --get-login > /dev/null 2>&1; then
    echo "Logged into Docker Hub"
    echo "Note: Free Docker Hub accounts have rate limits"
    echo "- 200 pulls per 6 hours for anonymous users"
    echo "- 200 pulls per 6 hours for free authenticated users"
    echo "- 5000 pulls per 6 hours for Pro users"
else
    echo "Not logged into Docker Hub"
fi
echo ""

# Test pushing a small image
echo "7. Testing Docker Hub push with a small image..."
docker pull hello-world
docker tag hello-world test-push:latest
echo "Attempting to push test image..."
docker push test-push:latest || echo "Push failed - this is expected for test purposes"
docker rmi test-push:latest hello-world
echo ""

echo "=== Troubleshooting Complete ==="
echo ""
echo "Common issues and solutions:"
echo "1. Docker Hub credentials not configured in Jenkins"
echo "   - Go to Jenkins > Manage Jenkins > Credentials"
echo "   - Add new credentials with ID 'docker-hub-credentials'"
echo "   - Use Username/Password type"
echo ""
echo "2. Docker Hub rate limits"
echo "   - Free accounts have limits on pulls and pushes"
echo "   - Consider upgrading to Pro account for production"
echo ""
echo "3. Network connectivity"
echo "   - Check firewall settings"
echo "   - Verify DNS resolution"
echo "   - Test with: ping registry-1.docker.io"
echo ""
echo "4. Repository permissions"
echo "   - Ensure the repository exists on Docker Hub"
echo "   - Verify you have push permissions"
echo "   - Check repository name matches Jenkinsfile" 