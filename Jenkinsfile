pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
        DOCKER_USERNAME = ""
        DOCKER_IMAGE_NODE = "${DOCKER_USERNAME}/node-app"
        DOCKER_IMAGE_STATIC = "${DOCKER_USERNAME}/webimage"
        SONAR_HOST_URL = credentials('sonar-host-url')
        SONAR_AUTH_TOKEN = credentials('sonar-token-id')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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
                    script {
                        echo 'Building Node.js application'
                        sh 'npm install'
                        sh 'npm run build || true'
                        sh 'npm run test'
                        sh "docker build -t ${DOCKER_IMAGE_NODE}:v1 ."
                    }
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
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_AUTH_TOKEN}
                    """
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
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            passwordVariable: 'DOCKER_PASSWORD',
                            usernameVariable: 'DOCKER_USERNAME'
                        )
                    ]) {

                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${DOCKER_IMAGE_NODE}:v1"
                    }
                }
            }
        }

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
                    script {
                        echo "Building static web project"
                        sh "docker build -t ${DOCKER_IMAGE_STATIC}:v5 ."
                    }
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
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=web-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_AUTH_TOKEN}
                    """
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
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            passwordVariable: 'DOCKER_PASSWORD',
                            usernameVariable: 'DOCKER_USERNAME'
                        )
                    ]) {

                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${DOCKER_IMAGE_STATIC}:v5"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up'
            sh 'docker logout || true'
        }
    }
}
