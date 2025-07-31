pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "hao06122005"
        IMAGE_NAME = "shoestore"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages { 
        stage('SCM') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis...'
                script {
                    def scannerHome = tool 'SonarScanner for .NET'
                    withSonarQubeEnv('SonarQube') {
                        bat "\"${scannerHome}\\SonarScanner.MSBuild.exe\" begin /k:\"shoestore\" /n:\"Shoestore\" /v:\"1.0\""
                        bat "dotnet build"
                        bat "\"${scannerHome}\\SonarScanner.MSBuild.exe\" end"
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'dotnet test --no-build --verbosity normal'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    try {
                        sh 'docker --version'
                        sh "docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                        sh "docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                        echo 'Docker image built successfully!'
                    } catch (Exception e) {
                        echo 'Docker build failed: ' + e.getMessage()
                        echo 'Please ensure Docker is installed and running on Jenkins server'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing to Docker Hub...'
                script {
                    try {
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            echo 'Attempting Docker Hub login...'
                            // Use secure credential handling - avoid string interpolation
                            sh '''
                                echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                            '''
                            
                            echo 'Checking Docker Hub connectivity...'
                            sh 'docker search hello-world --limit 1'
                            
                            echo 'Pushing tagged image...'
                            // Use environment variables directly to avoid interpolation
                            sh '''
                                docker push hao06122005/shoestore:$BUILD_NUMBER
                            '''
                            
                            echo 'Pushing latest tag...'
                            sh '''
                                docker push hao06122005/shoestore:latest
                            '''
                            
                            echo 'Docker Hub push completed successfully!'
                        }
                    } catch (Exception e) {
                        echo 'Docker Hub push failed: ' + e.getMessage()
                        echo 'Checking Docker Hub credentials and connectivity...'
                        script {
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                                sh '''
                                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin || echo "Login failed"
                                '''
                            }
                        }
                        sh 'docker images'
                        error 'Docker Hub push failed - check credentials and network connectivity'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Build succeeded!'
            echo 'SonarQube analysis completed. Check: http://localhost:9000'
            echo "Docker image pushed to: hao06122005/shoestore:${env.BUILD_NUMBER}"
        }
        failure {
            echo 'Build failed!'
            script {
                echo 'Docker Hub push troubleshooting:'
                echo '1. Check if docker-hub-credentials are properly configured in Jenkins'
                echo '2. Verify Docker Hub username and password are correct'
                echo '3. Check network connectivity to Docker Hub'
                echo '4. Verify Docker Hub rate limits (free accounts have limits)'
                echo '5. Ensure the Docker Hub repository exists and is accessible'
                echo '6. Check if Docker Hub is experiencing service issues'
            }
        }
        unstable {
            echo 'Build unstable - check Docker installation or SonarQube configuration'
        }
        always {
            echo 'Cleaning up Docker images...'
            script {
                try {
                    sh '''
                        docker rmi hao06122005/shoestore:$BUILD_NUMBER || true
                        docker rmi hao06122005/shoestore:latest || true
                        docker system prune -f || true
                    '''
                } catch (Exception e) {
                    echo 'Cleanup failed: ' + e.getMessage()
                }
            }
        }
    }
}