
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Pulls your code from the Git repository
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    // 1. Get the path to the scanner tool named 'sonar-scanner'
                    // This fixes the "null/bin" error you were seeing
                    def scannerHome = tool 'sonar-scanner'
                    
                    // 2. Use the 'sonar-token' credential ID from your second photo
                    withSonarQubeEnv('sonar-scanner') {
                        // 3. Execute the scanner using the correct path
                        sh "${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=my-microservice-project \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000"
                    }
                }
            }
        }

        stage("Quality Gate") {
            steps {
                // Waits for SonarQube results (timeout set to 1 hour)
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
