pipeline {
    agent any

    environment {
        // We will load these dynamically in the steps using withCredentials
        SONAR_URL = ''
        SONAR_USER = ''
        SONAR_PASS = ''
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building the project...'
                // Add your build commands here, e.g., npm install, mvn clean package, etc.
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    // Load credentials dynamically
                    withCredentials([
                        string(credentialsId: 'SONAR_HOST', variable: 'SONAR_URL'),
                        usernamePassword(credentialsId: 'SONAR_CREDS', usernameVariable: 'SONAR_USER', passwordVariable: 'SONAR_PASS')
                    ]) {
                        sh """
                            echo "Running SonarQube scan..."
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
            node {
                echo 'Pipeline finished. Running cleanup...'
                sh 'docker logout || true'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs!'
        }
    }
}pipeline {
    agent any

    environment {
        // Sonar credentials from Jenkins
        SONAR_HOST_URL = credentials('SonarHost')   // Sonar URL credential ID
        SONAR_AUTH_TOKEN = credentials('SonarToken') // Sonar token credential ID
    }

    stages {

        stage('Checkout') {
            steps {
                git(
                    url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                    credentialsId: 'GitHubCred',
                    branch: 'main'
                )
            }
        }

        // ======================
        // Node.js App Build Stage
        // ======================
        stage('Build Node.js App') {
            when {
                expression { 
                    // Only build if files under node-app/ changed
                    sh(script: "git diff --name-only HEAD~1 HEAD | grep ^node-app/", returnStatus: true) == 0 
                }
            }
            steps {
                dir('node-app') {
                    echo 'Building Node.js app'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        // ======================
        // Static Web App Stage
        // ======================
        stage('Build Static Web App') {
            when {
                expression { 
                    // Only build if files under multi-app/ changed
                    sh(script: "git diff --name-only HEAD~1 HEAD | grep ^multi-app/", returnStatus: true) == 0 
                }
            }
            steps {
                dir('multi-app') {
                    echo 'Building Static Web App'

                    // Docker login using Jenkins credentials
                    withCredentials([
                        usernamePassword(credentialsId: 'DockerCred', 
                                         passwordVariable: 'DOCKER_PASSWORD', 
                                         usernameVariable: 'DOCKER_USERNAME')
                    ]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker build -t $DOCKER_USERNAME/webimage:v5 .'
                        sh 'docker push $DOCKER_USERNAME/webimage:v5'
                    }
                }
            }
        }

        // ======================
        // SonarQube Analysis
        // ======================
        stage('SonarQube Analysis') {
            steps {
                script {
                    def changedNode = sh(script: "git diff --name-only HEAD~1 HEAD | grep ^node-app/", returnStatus: true) == 0
                    def changedWeb = sh(script: "git diff --name-only HEAD~1 HEAD | grep ^multi-app/", returnStatus: true) == 0

                    if (changedNode) {
                        dir('node-app') {
                            echo 'Running SonarQube analysis for Node.js app'
                            withEnv([
                                "SONAR_HOST_URL=${env.SONAR_HOST_URL}",
                                "SONAR_AUTH_TOKEN=${env.SONAR_AUTH_TOKEN}"
                            ]) {
                                sh '/opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner ' +
                                   '-Dsonar.projectKey=node-app ' +
                                   '-Dsonar.sources=. ' +
                                   '-Dsonar.host.url=$SONAR_HOST_URL ' +
                                   '-Dsonar.login=$SONAR_AUTH_TOKEN'
                            }
                        }
                    }

                    if (changedWeb) {
                        dir('multi-app') {
                            echo 'Running SonarQube analysis for Static Web app'
                            withEnv([
                                "SONAR_HOST_URL=${env.SONAR_HOST_URL}",
                                "SONAR_AUTH_TOKEN=${env.SONAR_AUTH_TOKEN}"
                            ]) {
                                sh '/opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner ' +
                                   '-Dsonar.projectKey=web-app ' +
                                   '-Dsonar.sources=. ' +
                                   '-Dsonar.host.url=$SONAR_HOST_URL ' +
                                   '-Dsonar.login=$SONAR_AUTH_TOKEN'
                            }
                        }
                    }
                }
            }
        }

    } // end stages

    post {
        always {
            // Logout from Docker to clean up
            sh 'docker logout'
            echo 'Pipeline finished, cleanup done.'
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check logs!'
        }
    }
}
