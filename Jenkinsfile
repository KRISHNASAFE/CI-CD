pipeline {
    agent any

    environment {
        SONAR_HOST = credentials('SONAR_HOST')      // Secret text for Sonar URL
        SONAR_CREDS = credentials('SONAR_CREDS')    // Username/password
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                    credentialsId: 'GitHubCred'
            }
        }

        stage('Detect Changed Apps') {
            steps {
                script {
                    CHANGED_APPS = []

                    // Get files changed in the latest commit
                    def changesText = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim()
                    if (changesText) {
                        def changes = changesText.split('\n')
                        for (c in changes) {
                            if (c.startsWith('node/') && !CHANGED_APPS.contains('node')) {
                                CHANGED_APPS << 'node'
                            }
                            if (c.startsWith('web-app-static/') && !CHANGED_APPS.contains('web-app-static')) {
                                CHANGED_APPS << 'web-app-static'
                            }
                        }
                    }

                    echo "Apps changed in the latest commit: ${CHANGED_APPS}"

                    if (CHANGED_APPS.isEmpty()) {
                        currentBuild.result = 'SUCCESS'
                        error('No changes detected in monitored apps. Skipping build.')
                    }
                }
            }
        }

        stage('Build & Test Changed Apps') {
            steps {
                script {
                    if (CHANGED_APPS.contains('node')) {
                        dir('node') {
                            echo "Building Node app..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }

                    if (CHANGED_APPS.contains('web-app-static')) {
                        dir('web-app-static') {
                            echo "Building Web App Static..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    if (CHANGED_APPS.contains('node')) {
                        dir('node') {
                            echo "Running SonarQube for Node app..."
                            sh """
                                sonar-scanner \
                                    -Dsonar.projectKey=node-app \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_HOST} \
                                    -Dsonar.login=${SONAR_CREDS_USR} \
                                    -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }

                    if (CHANGED_APPS.contains('web-app-static')) {
                        dir('web-app-static') {
                            echo "Running SonarQube for Web App Static..."
                            sh """
                                sonar-scanner \
                                    -Dsonar.projectKey=web-app-static \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_HOST} \
                                    -Dsonar.login=${SONAR_CREDS_USR} \
                                    -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}pipeline {
    agent any

    environment {
        SONAR_HOST = credentials('SONAR_HOST')   // Secret text with Sonar URL
        SONAR_CREDS = credentials('SONAR_CREDS') // Username/password
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                        credentialsId: 'GitHubCred'
                    ]]
                ])
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    CHANGED_APPS = []
                    def changesText = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim()
                    def changes = changesText.split("\n")

                    for (c in changes) {
                        if (c.startsWith("node/") && !CHANGED_APPS.contains("node")) {
                            CHANGED_APPS << "node"
                        }
                        if (c.startsWith("web-app-static/") && !CHANGED_APPS.contains("web-app-static")) {
                            CHANGED_APPS << "web-app-static"
                        }
                    }

                    if (CHANGED_APPS.isEmpty()) {
                        echo "No changes in monitored folders, skipping build."
                        currentBuild.result = 'SUCCESS'
                        return
                    }

                    echo "Changed apps: ${CHANGED_APPS}"
                }
            }
        }

        stage('Build & Test') {
            when {
                expression { CHANGED_APPS.size() > 0 }
            }
            steps {
                script {
                    if (CHANGED_APPS.contains("node")) {
                        dir('node') {
                            echo "Building Node app..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }

                    if (CHANGED_APPS.contains("web-app-static")) {
                        dir('web-app-static') {
                            echo "Building Web-App-Static..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { CHANGED_APPS.size() > 0 }
            }
            steps {
                script {
                    if (CHANGED_APPS.contains("node")) {
                        dir('node') {
                            sh """
                            sonar-scanner \
                              -Dsonar.projectKey=node-app \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=${SONAR_HOST} \
                              -Dsonar.login=${SONAR_CREDS_USR} \
                              -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }
                    if (CHANGED_APPS.contains("web-app-static")) {
                        dir('web-app-static') {
                            sh """
                            sonar-scanner \
                              -Dsonar.projectKey=web-app-static \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=${SONAR_HOST} \
                              -Dsonar.login=${SONAR_CREDS_USR} \
                              -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning workspace..."
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}pipeline {
    agent any

    environment {
        // Sonar secret text (URL) and username/password
        SONAR_HOST = credentials('SONAR_HOST')   // Secret text with Sonar URL
        SONAR_CREDS = credentials('SONAR_CREDS') // Username/password credential
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                        credentialsId: 'GitHubCred'
                    ]]
                ])
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    // Determine if node or web-app-static changed in last commit
                    CHANGED_APPS = []
                    def changes = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim().split("\n")
                    if (changes.any { it.startsWith('node/') }) {
                        CHANGED_APPS << 'node'
                    }
                    if (changes.any { it.startsWith('web-app-static/') }) {
                        CHANGED_APPS << 'web-app-static'
                    }

                    if (CHANGED_APPS.isEmpty()) {
                        echo "No changes detected in monitored folders. Skipping build."
                        currentBuild.result = 'SUCCESS'
                        return
                    }

                    echo "Changed apps: ${CHANGED_APPS}"
                }
            }
        }

        stage('Build & Test') {
            when {
                expression { CHANGED_APPS.contains('node') || CHANGED_APPS.contains('web-app-static') }
            }
            steps {
                script {
                    if (CHANGED_APPS.contains('node')) {
                        dir('node') {
                            echo "Building Node app..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                    if (CHANGED_APPS.contains('web-app-static')) {
                        dir('web-app-static') {
                            echo "Building Web-App-Static..."
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { CHANGED_APPS.contains('node') || CHANGED_APPS.contains('web-app-static') }
            }
            steps {
                script {
                    if (CHANGED_APPS.contains('node')) {
                        dir('node') {
                            echo "Running Sonar analysis for Node..."
                            sh """
                                sonar-scanner \
                                  -Dsonar.projectKey=node-app \
                                  -Dsonar.sources=. \
                                  -Dsonar.host.url=${SONAR_HOST} \
                                  -Dsonar.login=${SONAR_CREDS_USR} \
                                  -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }
                    if (CHANGED_APPS.contains('web-app-static')) {
                        dir('web-app-static') {
                            echo "Running Sonar analysis for Web-App-Static..."
                            sh """
                                sonar-scanner \
                                  -Dsonar.projectKey=web-app-static \
                                  -Dsonar.sources=. \
                                  -Dsonar.host.url=${SONAR_HOST} \
                                  -Dsonar.login=${SONAR_CREDS_USR} \
                                  -Dsonar.password=${SONAR_CREDS_PSW}
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning workspace..."
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check logs!"
        }
    }
}pipeline {
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
