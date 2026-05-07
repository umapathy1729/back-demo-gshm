
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
                    def scannerHome = tool 'sonar-scanner'

                    // 2. Use the 'sonar-scanner' name from your System Config
                    withSonarQubeEnv('sonar-scanner') {
                        // 3. Execute the scanner. 
                        // Added -Dsonar.javascript.node.maxspace=1024 to fix the WebSocket error
                        sh "${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=my-microservice-project \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://13.200.14.126:9000 \
                        -Dsonar.javascript.node.maxspace=1024"
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
