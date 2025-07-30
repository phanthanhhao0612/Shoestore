# CI/CD Pipeline Troubleshooting Guide

## Overview
This guide helps diagnose and fix issues with the Jenkins CI/CD pipeline, particularly the "Push to Docker Hub" stage failure.

## Current Pipeline Stages
1. **Checkout SCM** - Downloads source code
2. **SCM** - Source code management
3. **SonarQube Analysis** - Code quality analysis
4. **Test** - Runs unit tests
5. **Build Docker Image** - Creates Docker image
6. **Push to Docker Hub** - Pushes image to Docker Hub ⚠️ **FAILING**
7. **Post Actions** - Cleanup and notifications

## Common Issues and Solutions

### 1. Docker Hub Credentials Not Configured

**Problem**: Jenkins cannot authenticate with Docker Hub

**Solution**:
1. Go to Jenkins Dashboard
2. Navigate to **Manage Jenkins** → **Manage Credentials**
3. Click on **System** → **Global credentials**
4. Click **Add Credentials**
5. Configure:
   - **Kind**: Username with password
   - **Scope**: Global
   - **ID**: `docker-hub-credentials`
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password/token
   - **Description**: Docker Hub credentials for CI/CD

### 2. Docker Hub Rate Limits

**Problem**: Free Docker Hub accounts have push/pull limits

**Limits**:
- Anonymous users: 200 pulls per 6 hours
- Free authenticated users: 200 pulls per 6 hours
- Pro users: 5000 pulls per 6 hours

**Solutions**:
- Upgrade to Docker Hub Pro account
- Use alternative registries (GitHub Container Registry, Azure Container Registry)
- Implement caching strategies

### 3. Network Connectivity Issues

**Problem**: Jenkins server cannot reach Docker Hub

**Diagnosis**:
```bash
# Test connectivity
ping registry-1.docker.io

# Test DNS resolution
nslookup registry-1.docker.io

# Test Docker Hub search
docker search hello-world --limit 1
```

**Solutions**:
- Check firewall settings
- Configure proxy if needed
- Verify DNS settings

### 4. Repository Permissions

**Problem**: Cannot push to Docker Hub repository

**Check**:
1. Repository exists on Docker Hub
2. You have push permissions
3. Repository name matches Jenkinsfile (`hao06122005/shoestore`)

**Solution**:
- Create repository on Docker Hub if it doesn't exist
- Ensure you're the owner or have push access
- Verify repository name in Jenkinsfile

### 5. Docker Installation Issues

**Problem**: Docker not properly installed on Jenkins server

**Diagnosis**:
```bash
docker --version
docker info
```

**Solutions**:
- Install Docker on Jenkins server
- Add Jenkins user to docker group
- Restart Docker service

## Troubleshooting Steps

### Step 1: Run the Troubleshooting Script
```bash
chmod +x docker-hub-troubleshoot.sh
./docker-hub-troubleshoot.sh
```

### Step 2: Check Jenkins Credentials
1. Verify `docker-hub-credentials` exists in Jenkins
2. Test credentials manually:
```bash
export DOCKER_USERNAME="your-username"
export DOCKER_PASSWORD="your-password"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
```

### Step 3: Test Docker Hub Push Manually
```bash
# Build image locally
docker build -t hao06122005/shoestore:test .

# Login to Docker Hub
docker login

# Push image
docker push hao06122005/shoestore:test
```

### Step 4: Check Jenkins Logs
1. Go to Jenkins build page
2. Click on "Push to Docker Hub" stage
3. View console output for specific error messages

## Updated Jenkinsfile Features

The updated Jenkinsfile includes:

1. **Better Error Handling**: Try-catch blocks with detailed error messages
2. **Debugging Information**: Docker version, info, and image verification
3. **Connectivity Tests**: Docker Hub search to verify connectivity
4. **Detailed Logging**: Step-by-step progress messages
5. **Cleanup**: Automatic image cleanup in post actions
6. **Troubleshooting Tips**: Built-in guidance for common issues

## Alternative Solutions

### Option 1: Use GitHub Container Registry
```groovy
environment {
    DOCKER_REGISTRY = "ghcr.io"
    IMAGE_NAME = "your-username/shoestore"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
}
```

### Option 2: Use Azure Container Registry
```groovy
environment {
    DOCKER_REGISTRY = "your-registry.azurecr.io"
    IMAGE_NAME = "shoestore"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
}
```

### Option 3: Skip Docker Hub Push (Development)
Comment out the "Push to Docker Hub" stage for development builds.

## Monitoring and Alerts

### Jenkins Notifications
Configure email notifications in Jenkins:
1. Go to **Manage Jenkins** → **Configure System**
2. Configure SMTP settings
3. Add email notifications to pipeline

### Docker Hub Monitoring
- Monitor rate limits in Docker Hub dashboard
- Set up alerts for failed pushes
- Track image usage and storage

## Best Practices

1. **Use Docker Hub Access Tokens** instead of passwords
2. **Implement Image Tagging Strategy** (latest, version, commit hash)
3. **Set up Image Scanning** for security vulnerabilities
4. **Use Multi-stage Builds** to reduce image size
5. **Implement Caching** to speed up builds
6. **Monitor Resource Usage** (CPU, memory, disk)

## Support

If issues persist:
1. Check Jenkins server logs
2. Verify Docker Hub account status
3. Test with a simple "hello-world" image
4. Consider using alternative container registries
5. Review network and firewall configurations 