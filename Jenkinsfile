pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"

        // Docker
        DOCKER_USERNAME = ""
        DOCKER_IMAGE_NODE = "${DOCKER_USERNAME}/node-app"
        DOCKER_IMAGE_STATIC = "${DOCKER_USERNAME}/webimage"

        // SonarQube
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
                    sh "docker build -t ${DOCKER_IMAGE_NODE}:v1 ."
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
                        usernamePassword(
                            credentialsId: 'SONAR_CREDS',
                            usernameVariable: 'SONAR_USER',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=node-app \
                                -Dsonar.projectName=node-app \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_USER} \
                                -Dsonar.password=${SONAR_TOKEN}
                        """
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
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh "docker push ${DOCKER_IMAGE_NODE}:v1"
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
                    sh "docker build -t ${DOCKER_IMAGE_STATIC}:v5 ."
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
                        usernamePassword(
                            credentialsId: 'SONAR_CREDS',
                            usernameVariable: 'SONAR_USER',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=web-app \
                                -Dsonar.projectName=web-app \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_USER} \
                                -Dsonar.password=${SONAR_TOKEN}
                        """
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
                    echo "Building Static Web App Docker image for $DOCKER_USERNAME"
                sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'

                // Use the bound username to tag the image
                sh "docker build -t ${DOCKER_USERNAME}/webimage:v5 ."
                sh "docker push ${DOCKER_USERNAME}/webimage:v5"
                    //sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    //sh "docker push ${DOCKER_IMAGE_STATIC}:v5"
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
