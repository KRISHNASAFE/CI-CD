pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
        SONAR_CREDS = "SONAR_CREDS" // type: Username with password
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
                    return sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim() != ''
                }
            }
            steps {
                dir('node-app') {
                    sh 'npm install'
                    sh 'npm run build || true'
                    sh 'npm run test'
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        sh 'docker build -t $DOCKER_USERNAME/node-app:v1 .'
                    }
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression {
                    return sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim() != ''
                }
            }
            steps {
                dir('node-app') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${SONAR_CREDS}",
                            usernameVariable: 'SONAR_URL',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                        /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                          -Dsonar.projectKey=node-app \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_URL \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Deploy Node.js App') {
            when {
                expression {
                    return sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
                        returnStdout: true
                    ).trim() != ''
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
                    sh 'docker push $DOCKER_USERNAME/node-app:v1'
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression {
                    return sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim() != ''
                }
            }
            steps {
                dir('multi-app') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker push $DOCKER_USERNAME/webimage:v5'
                    }
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression {
                    return sh(
                        script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
                        returnStdout: true
                    ).trim() != ''
                }
            }
            steps {
                dir('multi-app') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${SONAR_CREDS}",
                            usernameVariable: 'SONAR_URL',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                        /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                          -Dsonar.projectKey=web-app \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_URL \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
        SONAR_CREDS = "SONAR_CREDS" // This is a Jenkins credential of type "Username with password"
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
                        withCredentials([
                            usernamePassword(
                                credentialsId: "${DOCKER_REGISTRY_CREDS}",
                                usernameVariable: 'DOCKER_USERNAME',
                                passwordVariable: 'DOCKER_PASSWORD'
                            )
                        ]) {
                            def dockerImageNode = "${DOCKER_USERNAME}/node-app"
                            sh "docker build -t ${dockerImageNode}:v1 ."
                        }
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
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${SONAR_CREDS}",
                            usernameVariable: 'SONAR_USER',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                        /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                          -Dsonar.projectKey=node-app \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_USER \
                          -Dsonar.login=$SONAR_TOKEN
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
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        def dockerImageNode = "${DOCKER_USERNAME}/node-app"
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${dockerImageNode}:v1"
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
                        withCredentials([
                            usernamePassword(
                                credentialsId: "${DOCKER_REGISTRY_CREDS}",
                                usernameVariable: 'DOCKER_USERNAME',
                                passwordVariable: 'DOCKER_PASSWORD'
                            )
                        ]) {
                            def dockerImageStatic = "${DOCKER_USERNAME}/webimage"
                            sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                            sh "docker push ${dockerImageStatic}:v5"
                        }
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
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${SONAR_CREDS}",
                            usernameVariable: 'SONAR_USER',
                            passwordVariable: 'SONAR_TOKEN'
                        )
                    ]) {
                        sh """
                        /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                          -Dsonar.projectKey=web-app \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_USER \
                          -Dsonar.login=$SONAR_TOKEN
                        """
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
}pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
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
                        withCredentials([
                            usernamePassword(
                                credentialsId: "${DOCKER_REGISTRY_CREDS}",
                                usernameVariable: 'DOCKER_USERNAME',
                                passwordVariable: 'DOCKER_PASSWORD'
                            )
                        ]) {
                            def dockerImageNode = "${DOCKER_USERNAME}/node-app"
                            sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                            sh "docker build -t ${dockerImageNode}:v1 ."
                        }
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
                    /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                      -Dsonar.projectKey=node-app \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
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
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        def dockerImageNode = "${DOCKER_USERNAME}/node-app"
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${dockerImageNode}:v1"
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
                        withCredentials([
                            usernamePassword(
                                credentialsId: "${DOCKER_REGISTRY_CREDS}",
                                usernameVariable: 'DOCKER_USERNAME',
                                passwordVariable: 'DOCKER_PASSWORD'
                            )
                        ]) {
                            def dockerImageStatic = "${DOCKER_USERNAME}/webimage"
                            sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                            sh "docker push ${dockerImageStatic}:v5"
                        }
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
                    /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner \
                      -Dsonar.projectKey=web-app \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
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
