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
                        dir /repo --config /repo/.gitleaks.toml --verbose --redact
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
                        $passwordFile = [System.IO.Path]::GetTempFileName()

                        try {
                            $encoding = New-Object System.Text.UTF8Encoding($false)

                            [System.IO.File]::WriteAllText(
                                $passwordFile,
                                $env:DOCKER_PASSWORD,
                                $encoding
                            )

                            $cmd = 'docker login -u "' +
                                $env:DOCKER_USERNAME +
                                '" --password-stdin < "' +
                                $passwordFile +
                                '"'

                            & $env:ComSpec /d /s /c $cmd
                            $exitCode = $LASTEXITCODE

                            if ($exitCode -ne 0) {
                                throw "Docker Hub login failed"
                            }
                        }
                        finally {
                            Remove-Item $passwordFile -Force -ErrorAction SilentlyContinue
                        }
                    '''

                    bat '''
                        docker push %DOCKER_IMAGE%:%BUILD_NUMBER%
                        if errorlevel 1 exit /b 1

                        docker push %DOCKER_IMAGE%:latest
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }



        stage('Deploy to Azure AKS') {
            steps {
                echo 'Deploying CloudCalc to Azure AKS using Ansible...'
                bat 'wsl.exe -d Ubuntu -- bash -lc "cd ~/cloudcalc-ansible && source .venv/bin/activate && ansible-playbook playbooks/deploy.yml && kubectl rollout restart deployment/cloudcalc -n cloudcalc && kubectl rollout status deployment/cloudcalc -n cloudcalc --timeout=300s"'
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