
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'hamritha04/cloudcalc'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Environment Check') {
            steps {
                bat 'java -version'
                bat 'mvn -version'
                bat 'docker --version'
                bat 'docker info'
            }
        }

        stage('Gitleaks Security Scan') {
            steps {
                echo 'Scanning repository for exposed secrets...'

                bat '''
                    docker run --rm ^
                    -v "%WORKSPACE%:/repo" ^
                    zricethezav/gitleaks:latest ^
                    detect --source=/repo --verbose --redact
                '''
            }
        }

        stage('Maven Build and Test') {
            steps {
                bat 'mvn clean verify'
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat '''
                    docker build ^
                    -t %DOCKER_IMAGE%:%BUILD_NUMBER% ^
                    -t %DOCKER_IMAGE%:latest .
                '''
            }
        }

        
        stage('Docker Hub Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    powershell '''
                        Write-Host "Docker username: $env:DOCKER_USERNAME"
                        Write-Host "Docker token length: $($env:DOCKER_PASSWORD.Length)"

                        $env:DOCKER_PASSWORD | docker login `
                            --username $env:DOCKER_USERNAME `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            exit 1
                        }
                    '''

                    bat '''
                        docker push %DOCKER_IMAGE%:%BUILD_NUMBER%
                        docker push %DOCKER_IMAGE%:latest
                    '''
                }
            }
        }

    }

    post {
        success {
            echo 'CloudCalc CI pipeline completed successfully!'
        }

        failure {
            echo 'CloudCalc CI pipeline failed. Check the stage logs.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
