pipeline {
    agent any

    environment {
        // This must match the name you gave in 'Global Tool Configuration' for SonarQube Scanner
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the code from your Git repository
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // 'sonar-server' must match the 'Name' you saved in 'System Configuration'
                withSonarQubeEnv('sonar-token') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=my-microservice-project \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // This waits for SonarQube to finish processing and returns a status
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
