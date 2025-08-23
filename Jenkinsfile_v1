pipeline {
    agent any

    stages {
        // Checkout the code
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Stage for Node.js App
        stage('Build Node.js App') {
            when {
                changeset "**/node-app/**"  // Triggers if changes are detected in the node-app directory
            }
            steps {
                dir('node-app') {
                    script {
                        echo 'Building Node.js application'
                        sh 'npm install'
                        sh 'npm run build'
                        sh 'npm run test' 
                        sh 'npm run start' 
                    }
                }
            }
        }

        // Stage for Static Web App
        stage('Build Static Web App') {
            when {
                changeset "**/multi-app/**"  // Triggers if changes are detected in the static-web directory
            }
            steps {
                dir('multi-app') {
                    script {
                        echo 'Building Static Web project'
                        // Or just copy files, depending on your build process
                          // Could be different for a static app (e.g., using Gulp, Webpack, etc.)
                    }
                }
            }
        }

        // Optional Deploy Stage
        stage('Deploy') {
            steps {
                echo 'Deploying the app'
                // Implement deployment steps here
            }
        }
    }
   
    post {
        always {
            echo 'Cleaning up...'
            // Add any cleanup steps here
        }
    }
}
