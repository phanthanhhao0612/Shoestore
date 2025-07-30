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
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}'
                        sh 'docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Build succeeded!'
            echo 'SonarQube analysis completed. Check: http://localhost:9000'
        }
        failure {
            echo 'Build failed!'
        }
        unstable {
            echo 'Build unstable - check Docker installation or SonarQube configuration'
        }
    }
}