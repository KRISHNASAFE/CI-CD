pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Node App') {
            when {
                expression {
                    // Only build if node/ folder has changes
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^node/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('node') {
                    echo 'Building Node app...'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Web App Static') {
            when {
                expression {
                    // Only build if web-app-static/ folder has changes
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^web-app-static/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('web-app-static') {
                    echo 'Building Web App Static...'
                    sh 'echo "Build commands for web-app-static here"'
                    // e.g., sh 'npm install' or other build commands
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                anyOf {
                    expression { sh(script: "git diff --name-only HEAD~1 HEAD | grep '^node/' || true", returnStatus: true) == 0 }
                    expression { sh(script: "git diff --name-only HEAD~1 HEAD | grep '^web-app-static/' || true", returnStatus: true) == 0 }
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'SONAR_HOST', variable: 'SONAR_URL'),
                    usernamePassword(credentialsId: 'SONAR_CREDS', usernameVariable: 'SONAR_USER', passwordVariable: 'SONAR_PASS')
                ]) {
                    echo "Running Sonar Scanner..."
                    sh """
                        /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=multi-app-project \
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
                // Add test commands
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Add deployment commands
            }
        }
    }

    post {
        always {
            node {
                echo 'Cleaning up workspace...'
                cleanWs()
            }
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed. Check logs!'
        }
    }
}
