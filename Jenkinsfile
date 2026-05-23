pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = credentials('DockerHub-Cred') 
        SONAR_TOKEN = credentials('SonarQube-Token')
        SONAR_HOST_URL = 'http://your-sonarqube-server'
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                          branches: [[name: '*/main']],
                          doGenerateSubmoduleConfigurations: false,
                          extensions: [],
                          userRemoteConfigs: [[url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                                               credentialsId: 'GitHub-Jenkins-Cred']]])
            }
        }

        stage('Build Node.js App') {
            when {
                expression { fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                    sh 'npm test || echo "No tests specified"'
                }
            }
        }

        stage('Dockerize Node App') {
            when {
                expression { fileExists('node-app/Dockerfile') }
            }
            steps {
                dir('node-app') {
                    script {
                        docker.withRegistry('', 'DockerHub-Cred') {
                            def appImage = docker.build("$DOCKER_USERNAME/node-app:v1")
                            appImage.push()
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression { fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL \
                        -v $(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.projectName=node-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression { fileExists('web-app-static/package.json') }
            }
            steps {
                dir('web-app-static') {
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression { fileExists('web-app-static/package.json') }
            }
            steps {
                dir('web-app-static') {
                    withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL \
                        -v $(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=web-app-static \
                        -Dsonar.projectName=web-app-static \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Must be inside 'script' to have node context
                node {
                    echo 'Cleaning workspace and logging out Docker'
                    sh 'docker logout || true'
                    cleanWs()
                }
            }
        }
    }
}pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = credentials('DockerHub-Cred') 
        SONAR_TOKEN = credentials('SonarQube-Token')
        SONAR_HOST_URL = 'http://your-sonarqube-server'
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                          branches: [[name: '*/main']],
                          doGenerateSubmoduleConfigurations: false,
                          extensions: [],
                          userRemoteConfigs: [[url: 'https://github.com/KRISHNASAFE/CI-CD.git',
                                               credentialsId: 'GitHub-Jenkins-Cred']]])
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
                }
            }
        }

        stage('Dockerize Node App') {
            when {
                expression { fileExists('node-app/Dockerfile') }
            }
            steps {
                dir('node-app') {
                    withCredentials([usernamePassword(credentialsId: 'DockerHub-Cred', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker build -t $DOCKER_USERNAME/node-app:v1 .'
                        sh 'docker push $DOCKER_USERNAME/node-app:v1'
                    }
                }
            }
        }

        stage('SonarQube Analysis - Node App') {
            when {
                expression { fileExists('node-app/package.json') }
            }
            steps {
                dir('node-app') {
                    withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL \
                        -v $(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=node-app \
                        -Dsonar.projectName=node-app \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Build Static Web App') {
            when {
                expression { fileExists('web-app-static/package.json') }
            }
            steps {
                dir('web-app-static') {
                    echo 'Building Web App'
                    sh 'npm install'
                    sh 'npm run build || echo "No build required"'
                }
            }
        }

        stage('SonarQube Analysis - Web App') {
            when {
                expression { fileExists('web-app-static/package.json') }
            }
            steps {
                dir('web-app-static') {
                    withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        docker run --rm -e SONAR_HOST_URL=$SONAR_HOST_URL \
                        -v $(pwd):/usr/src sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=web-app-static \
                        -Dsonar.projectName=web-app-static \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.login=$SONAR_TOKEN
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
    }
}
