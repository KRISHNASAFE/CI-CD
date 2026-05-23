pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = credentials('docker-hub-cred') // Docker Hub username/password
        SONAR_TOKEN = credentials('sonar-token')           // SonarQube token
        SONAR_HOST_URL = 'http://<YOUR_SONARQUBE_HOST>:9000' // replace with your SonarQube URL
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                        credentialsId: 'GitHub-Jenkins-Cred'
                    ]]
                ])
            }
        }

        stage('Build Node.js App') {
            when {
                expression { fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    echo 'Building Node.js application'
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                    sh 'npm test || echo "No tests specified"'

                    withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                        docker build -t $DOCKER_USERNAME/node-app:v1 .
                        docker push $DOCKER_USERNAME/node-app:v1
                        docker logout
                        '''
                    }

                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL -e SONAR_LOGIN=$SONAR_TOKEN \
                        -v \$(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.projectName=node-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression { fileExists('multi-app/index.html') }
            }
            steps {
                dir('multi-app') {
                    echo 'Building Static Web App'

                    withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                        docker build -t $DOCKER_USERNAME/webimage:v5 .
                        docker push $DOCKER_USERNAME/webimage:v5
                        docker logout
                        '''
                    }

                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL -e SONAR_LOGIN=$SONAR_TOKEN \
                        -v \$(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=web-app \
                        -Dsonar.projectName=web-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace'
            sh 'docker logout || true'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}pipeline {
    agent any

    environment {
        SONAR_HOST_URL = credentials('SONAR_HOST_URL')
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                        credentialsId: 'GitHub-Jenkins-Cred'
                    ]]
                ])
            }
        }

        stage('Build Node.js App') {
            when {
                expression { return fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    echo 'Building Node.js application'
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                    sh 'npm test || echo "No tests specified"'

                    withCredentials([usernamePassword(credentialsId: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh '''
                            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                            docker build -t $DOCKER_USERNAME/node-app:v1 .
                            docker push $DOCKER_USERNAME/node-app:v1
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression { return fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            docker run --rm \
                            -e SONAR_HOST_URL=$SONAR_HOST_URL \
                            -e SONAR_LOGIN=$SONAR_TOKEN \
                            -v $PWD:/usr/src \
                            sonarsource/sonar-scanner-cli \
                            -Dsonar.projectKey=node-app \
                            -Dsonar.projectName=node-app \
                            -Dsonar.sources=/usr/src
                        '''
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression { return fileExists('multi-app/index.html') }
            }
            steps {
                dir('multi-app') {
                    echo 'Building Static Web App'
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh '''
                            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                            docker build -t $DOCKER_USERNAME/webimage:v5 .
                            docker push $DOCKER_USERNAME/webimage:v5
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression { return fileExists('multi-app/index.html') }
            }
            steps {
                dir('multi-app') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            docker run --rm \
                            -e SONAR_HOST_URL=$SONAR_HOST_URL \
                            -e SONAR_LOGIN=$SONAR_TOKEN \
                            -v $PWD:/usr/src \
                            sonarsource/sonar-scanner-cli \
                            -Dsonar.projectKey=web-app \
                            -Dsonar.projectName=web-app \
                            -Dsonar.sources=/usr/src
                        '''
                    }
                }
            }
        }

    }

    post {
        always {
            echo 'Cleaning workspace and logging out Docker'
            sh 'docker logout || true'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed'
        }
        success {
            echo 'Pipeline succeeded'
        }
    }
}pipeline {
    agent any

    environment {
        SONAR_HOST_URL = credentials('SONAR_HOST_URL') // your SonarQube server URL
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                        credentialsId: 'GitHub-Jenkins-Cred'
                    ]]
                ])
            }
        }

        stage('Build Node.js App') {
            when {
                expression {
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('node-app') {
                    echo "Building Node.js application"
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                    sh 'npm test || echo "No tests specified"'
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_REGISTRY_CREDS', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                        docker build -t $DOCKER_USERNAME/node-app:v1 .
                        docker push $DOCKER_USERNAME/node-app:v1
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression {
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('node-app') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm \
                        -e SONAR_HOST_URL=${SONAR_HOST_URL} \
                        -e SONAR_LOGIN=${SONAR_TOKEN} \
                        -v "$(pwd)":/usr/src \
                        sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.projectName=node-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression {
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('multi-app') {
                    echo "Building Static Web App"
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_REGISTRY_CREDS', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                        docker build -t $DOCKER_USERNAME/webimage:v5 .
                        docker push $DOCKER_USERNAME/webimage:v5
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression {
                    return sh(script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true", returnStatus: true) == 0
                }
            }
            steps {
                dir('multi-app') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm \
                        -e SONAR_HOST_URL=${SONAR_HOST_URL} \
                        -e SONAR_LOGIN=${SONAR_TOKEN} \
                        -v "$(pwd)":/usr/src \
                        sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=web-app \
                        -Dsonar.projectName=web-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace and logging out Docker'
            sh 'docker logout || true'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}pipeline {
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
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker build -t $DOCKER_USERNAME/node-app:v1 ."
                        sh "docker push $DOCKER_USERNAME/node-app:v1"
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
                        string(credentialsId: 'SONAR_CREDS', variable: 'SONAR_TOKEN')
                    ]) {
                        sh """
                            docker run --rm \
                                -e SONAR_HOST_URL=${SONAR_HOST_URL} \
                                -v \$(pwd):/usr/src \
                                sonarsource/sonar-scanner-cli \
                                -Dsonar.projectKey=node-app \
                                -Dsonar.projectName=node-app \
                                -Dsonar.sources=/usr/src \
                                -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
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
                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_REGISTRY_CREDS}",
                            usernameVariable: 'DOCKER_USERNAME',
                            passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker build -t $DOCKER_USERNAME/webimage:v5 ."
                        sh "docker push $DOCKER_USERNAME/webimage:v5"
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
                        string(credentialsId: 'SONAR_CREDS', variable: 'SONAR_TOKEN')
                    ]) {
                        sh """
                            docker run --rm \
                                -e SONAR_HOST_URL=${SONAR_HOST_URL} \
                                -v \$(pwd):/usr/src \
                                sonarsource/sonar-scanner-cli \
                                -Dsonar.projectKey=web-app \
                                -Dsonar.projectName=web-app \
                                -Dsonar.sources=/usr/src \
                                -Dsonar.login=${SONAR_TOKEN}
                        """
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
