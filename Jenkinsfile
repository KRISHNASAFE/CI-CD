pipeline {
  agent any

  environment {
    DOCKER_REGISTRY_CREDS = "DOCKER_REGISTRY_CREDS"
    DOCKER_USERNAME = "dockcg007"
    DOCKER_IMAGE_NODE = "${DOCKER_USERNAME}/node-app"
    DOCKER_IMAGE_STATIC = "${DOCKER_USERNAME}/webimage"
  }

  stages {
    stage('checkout') {
      steps {
        checkout scm
      }
    }

    stage('build node.js app') {
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

    stage('deploy node js app') {
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
          withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
            sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
            sh "docker push ${DOCKER_IMAGE_NODE}:v1"
          }
        }
      }
    }

    stage('build-web-app-static') {
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
            echo "Building static-web-project"
            sh "docker build -t ${DOCKER_IMAGE_STATIC}:v5 ."
          }
        }
      }
    }

    stage('deploy-web-app-static') {
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
          withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
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
