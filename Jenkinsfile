pipeline {
    agent any  // Runs on any available node

    environment {
        NODE_APP_DIR = 'node-app'
        WEB_APP_DIR = 'web-app-static'
        SONAR_PROJECT_KEY_NODE = 'node-app'
        SONAR_PROJECT_KEY_WEB = 'web-app-static'
        SONAR_HOST_URL = 'http://your-sonarqube-server' // Change to your SonarQube URL
        SONAR_LOGIN = credentials('SonarQubeToken')    // Jenkins credential for Sonar
    }

    stages {

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
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
                    NODE_CHANGED = sh(script: "git diff --name-only HEAD~1 HEAD | grep '${NODE_APP_DIR}' || true", returnStdout: true).trim()
                    WEB_CHANGED = sh(script: "git diff --name-only HEAD~1 HEAD | grep '${WEB_APP_DIR}' || true", returnStdout: true).trim()
                    echo "Node app changes: ${NODE_CHANGED}"
                    echo "Web app changes: ${WEB_CHANGED}"
                }
            }
        }

        stage('Build Node App') {
            when {
                expression { return NODE_CHANGED != '' }
            }
            steps {
                dir("${NODE_APP_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Scan Node App') {
            when {
                expression { return NODE_CHANGED != '' }
            }
            steps {
                dir("${NODE_APP_DIR}") {
                    withSonarQubeEnv('SonarQube') { // The name must match your Jenkins SonarQube config
                        sh "sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY_NODE} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_LOGIN}"
                    }
                }
            }
        }

        stage('Build Web App') {
            when {
                expression { return WEB_CHANGED != '' }
            }
            steps {
                dir("${WEB_APP_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Scan Web App') {
            when {
                expression { return WEB_CHANGED != '' }
            }
            steps {
                dir("${WEB_APP_DIR}") {
                    withSonarQubeEnv('SonarQube') {
                        sh "sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY_WEB} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_LOGIN}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (NODE_CHANGED != '' || WEB_CHANGED != '') {
                        echo 'Deploying changed apps...'
                        sh './deploy.sh'
                    } else {
                        echo 'No changes detected. Skipping deployment.'
                    }
                }
            }
        }

    } // stages
}pipeline {
    agent { label 'jenkins' }   // safer than "any" in some setups

    environment {
        GIT_REPO = 'https://github.com/KRISHNASAFE/CI-CD.git'
        GIT_CRED = 'GitHubCred'

        SONAR_URL = credentials('SONAR_HOST')   // Secret Text (URL)
        SONAR_CREDS = credentials('SONAR_CREDS') // username/password
    }

    stages {

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: env.GIT_REPO,
                        credentialsId: env.GIT_CRED
                    ]]
                ])
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    CHANGED_APPS = []

                    def diff = sh(script: 'git diff --name-only HEAD~1 HEAD || true', returnStdout: true).trim()

                    def files = diff.tokenize("\n")

                    for (f in files) {
                        if (f.startsWith("node/") && !CHANGED_APPS.contains("node")) {
                            CHANGED_APPS.add("node")
                        }

                        if (f.startsWith("web-app-static/") && !CHANGED_APPS.contains("web-app-static")) {
                            CHANGED_APPS.add("web-app-static")
                        }
                    }

                    echo "Changed Apps => ${CHANGED_APPS}"
                }
            }
        }

        stage('Build Node App') {
            when { expression { return CHANGED_APPS.contains('node') } }
            steps {
                dir('node') {
                    sh 'echo Building Node App'
                    sh 'npm install'
                }
            }
        }

        stage('Build Web App') {
            when { expression { return CHANGED_APPS.contains('web-app-static') } }
            steps {
                dir('web-app-static') {
                    sh 'echo Building Web App'
                }
            }
        }

        stage('SonarQube - Node') {
            when { expression { return CHANGED_APPS.contains('node') } }
            steps {
                dir('node') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_URL} \
                        -Dsonar.login=${SONAR_CREDS_USR} \
                        -Dsonar.password=${SONAR_CREDS_PSW}
                    """
                }
            }
        }

        stage('SonarQube - Web') {
            when { expression { return CHANGED_APPS.contains('web-app-static') } }
            steps {
                dir('web-app-static') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=web-app-static \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_URL} \
                        -Dsonar.login=${SONAR_CREDS_USR} \
                        -Dsonar.password=${SONAR_CREDS_PSW}
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace...'
            cleanWs()
        }

        success {
            echo 'Build SUCCESS'
        }

        failure {
            echo 'Build FAILED'
        }
    }
}
