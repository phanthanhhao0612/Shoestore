pipeline {
    agent any
    
    environment {
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
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
                    try {
                        // Try to use configured tool first
                        def scannerHome
                        try {
                            scannerHome = tool 'SonarScanner for .NET'
                            echo 'Using configured SonarScanner for .NET tool'
                        } catch (Exception e) {
                            echo 'SonarScanner for .NET tool not configured, using alternative approach'
                            // Use dotnet sonarscanner if available
                            sh 'dotnet tool install --global dotnet-sonarscanner'
                            scannerHome = 'dotnet sonarscanner'
                        }
                        
                        // Run SonarQube analysis
                        withSonarQubeEnv('SonarQube') {
                            if (scannerHome == 'dotnet sonarscanner') {
                                sh 'dotnet sonarscanner begin /k:"shoestore" /n:"Shoestore" /v:"1.0"'
                                sh 'dotnet build'
                                sh 'dotnet sonarscanner end'
                            } else {
                                sh "\"${scannerHome}/SonarScanner.MSBuild.exe\" begin /k:\"shoestore\" /n:\"Shoestore\" /v:\"1.0\""
                                sh "dotnet build"
                                sh "\"${scannerHome}/SonarScanner.MSBuild.exe\" end"
                            }
                        }
                        echo 'SonarQube analysis completed successfully!'
                    } catch (Exception e) {
                        echo 'SonarQube analysis failed: ' + e.getMessage()
                        echo 'SonarQube analysis failed but continuing with pipeline...'
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building the application...'
                script {
                    try {
                        sh 'dotnet --version'
                        sh 'dotnet restore'
                        sh 'dotnet build --configuration Release --no-restore'
                        echo 'Build completed successfully!'
                    } catch (Exception e) {
                        echo 'Build failed: ' + e.getMessage()
                        currentBuild.result = 'FAILURE'
                        error('Build stage failed')
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    try {
                        sh 'dotnet test --no-build --verbosity normal --configuration Release'
                        echo 'Tests completed successfully!'
                    } catch (Exception e) {
                        echo 'Tests failed: ' + e.getMessage()
                        currentBuild.result = 'FAILURE'
                        error('Test stage failed')
                    }
                }
            }
        }
        
        stage('Publish') {
            steps {
                echo 'Publishing the application...'
                script {
                    try {
                        sh 'dotnet publish --configuration Release --output ./publish --no-build'
                        echo 'Application published successfully!'
                    } catch (Exception e) {
                        echo 'Publish failed: ' + e.getMessage()
                        currentBuild.result = 'FAILURE'
                        error('Publish stage failed')
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
            echo 'Build artifacts are available in the publish directory'
            echo 'SonarQube analysis completed. Check: http://localhost:9000'
        }
        failure {
            echo 'Pipeline failed!'
            echo 'Please check the build logs for more details'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
} 