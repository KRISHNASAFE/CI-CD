pipeline{
  agent any 
  environment {
    DOCKER_IMAGE_NODE = 'your-dockerhub-username/node-app'
    DOCKER_IMAGE_STATIC = 'your-dockerhub-username/web-app-static'
 }
  stages{
    stage('checkout'){
      checkout scm
    }
    stage('build node.js app'){
      when{
        expression{
          return sh(
            script: "git diff --name-only HEAD-1 HEAD | grep '^node-app/**' || true",
            returnStdout: true
          ).trim() != ''
        }
      }
      steps{
        dir('node-app'){
          script{
             echo 'Building Node.js application'
             sh 'npm install'
             sh 'npm run build || true'
             sh 'npm run test'
             sh "docker build -t ${DOCKER_IMAGE_NODE}:latest ."
          }
        }
      }
    }
    stage('deploy node js app'){
      when{
        expression{
          return sh(
          script: "git diff --name-only HEAD~1 HEAD | grep '^node-app/' || true",
          returnStdout: true
          ).trim() != ''
        }
      }
      steps{
        script{
          withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${DOCKER_IMAGE_NODE}:v1"
        }
      }
    }
  }
    stage('build-web-app-static'){
      when {
            expression {
              return sh(
              script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
              returnStdout: true
              ).trim() != ''
            }
        }
      steps{
        dir('multi-app'){
          script{
            echo "Building static-web-project"
            sh 'docker build -t ${DOCKER_IMAGES_STATIC}:v1 ."
          }
        }
      }
    }
    stage('deploy-web-app-static'){
      when{
        expression{
          return sh(
            script: "git diff --name-only HEAD~1 HEAD | grep '^multi-app/' || true",
            returnStdout: true
          ).trim != ''
        }
      }
      steps{
        script{
          withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh "docker push ${DOCKER_IMAGE_STATIC}:v1"
        }
      }
    }
  }
}

  post{
    always{
      echo 'Cleaning up'
      sh 'docker logout || true' 
    }
  }
}
