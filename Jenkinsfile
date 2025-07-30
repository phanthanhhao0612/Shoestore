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
            echo 'Build unstable - check SonarQube configuration'
        }
    }
}