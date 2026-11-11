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
                        $docker = (Get-Command docker.exe).Source

                        $psi = New-Object System.Diagnostics.ProcessStartInfo
                        $psi.FileName = $docker
                        $psi.Arguments = "login --username $env:DOCKER_USERNAME --password-stdin"
                        $psi.UseShellExecute = $false
                        $psi.RedirectStandardInput = $true
                        $psi.RedirectStandardOutput = $true
                        $psi.RedirectStandardError = $false

                        $process = New-Object System.Diagnostics.Process
                        $process.StartInfo = $psi

                        [void]$process.Start()

                        $bytes = [System.Text.Encoding]::UTF8.GetBytes(
                            $env:DOCKER_PASSWORD + "`n"
                        )

                        $process.StandardInput.BaseStream.Write(
                            $bytes, 0, $bytes.Length
                        )

                        $process.StandardInput.Close()

                        $output = $process.StandardOutput.ReadToEnd()
                        $process.WaitForExit()

                        Write-Host $output

                        if ($process.ExitCode -ne 0) {
                            Write-Error "Docker Hub login failed."
                            exit 1
                        }

                        Write-Host "Docker Hub login successful."
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