pipeline {
    agent any

    environment {
        // You can set global environment variables here if needed
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Git
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                // Add your build commands here
                // e.g., sh 'npm install' or sh 'mvn clean install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Inject Sonar credentials safely
                withCredentials([
                    string(credentialsId: 'SONAR_HOST', variable: 'SONAR_URL'),          // Secret Text credential for URL
                    usernamePassword(credentialsId: 'SONAR_CREDS', usernameVariable: 'SONAR_USER', passwordVariable: 'SONAR_PASS') // Username & Password
                ]) {
                    sh """
                        echo "Running Sonar Scanner..."
                        /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=web-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_URL \
                        -Dsonar.login=$SONAR_USER \
                        -Dsonar.password=$SONAR_PASS
                    """
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your test commands here
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Add your deployment commands here
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            // Optional cleanup steps
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed. Check logs!'
        }
    }
}
