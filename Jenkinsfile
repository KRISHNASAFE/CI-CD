pipeline {
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
