pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
        SONAR_HOST_URL = credentials('sonar-host-url')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /*
        =====================================================
        NODE APP
        =====================================================
        */
        stage('Build Node.js App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('node-app') {
                    echo 'Building Node.js application'
                    sh 'npm install'
                    sh 'npm run build || true'
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('node-app') {
                    withCredentials([
                        string(credentialsId: 'SONAR_CREDS', variable: 'SONAR_TOKEN')
                    ]) {
                        script {
                            
                        def scannerHome = tool 'sonar-scanner'
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=node-app \
                            -Dsonar.projectName=node-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_TOKEN}
                        """
                        }
                    }
                }
            }
        }

        stage('Deploy Node.js App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_REGISTRY_CREDS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    echo "Building & Pushing Node.js Docker image for $DOCKER_USERNAME"
                    sh "docker build -t ${DOCKER_USERNAME}/node-app:v1 ./node-app"
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh "docker push ${DOCKER_USERNAME}/node-app:v1"
                }
            }
        }

        /*
        =====================================================
        STATIC WEB APP
        =====================================================
        */
        stage('Build Static Web App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('multi-app') {
                    echo 'Building Static Web App'
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                dir('multi-app') {
                    withCredentials([
                        string(credentialsId: 'SONAR_CREDS', variable: 'SONAR_TOKEN')
                    ]) {
                        script 
                        {
                        
                        def scannerHome = tool 'sonar-scanner'
                            sh """
                        ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=node-app \
                            -Dsonar.projectName=node-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_TOKEN}
                        """
                        }
                    }
                }
            }
        }

        stage('Deploy Static Web App') {
            when {
                expression {
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim()
                    return changes != ''
                }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_REGISTRY_CREDS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    dir('multi-app') {
                        echo "Building & Pushing Static Web App Docker image for $DOCKER_USERNAME"
                        sh "docker build -t ${DOCKER_USERNAME}/webimage:v5 ."
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${DOCKER_USERNAME}/webimage:v5"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace and logging out Docker'
            sh 'docker logout || true'
        }
        success {
            echo 'Pipeline executed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
