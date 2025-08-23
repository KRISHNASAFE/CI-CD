pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Node.js App') {
            when {
                expression {
                    // Logic to check if files in node-app changed
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('node-app') {
                    script {
                        echo 'Building Node.js application'
                        sh 'npm install'
                        sh 'npm run build || true' //avoid fail if build not needed
                        sh 'npm run test'
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression {
                    // Logic to check if files in multi-app changed
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('multi-app') {
                    script {
                        echo 'Building Static Web project'
                        // Add your build logic here
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the app'
                // Deploy logic either server or creating image maybe using docker and pushing it.
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
        }
    }
}
