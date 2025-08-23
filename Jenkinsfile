pipeline{
  agent any
  stages {
    stage('Detect Changed Folders') {
      steps {
        script {
          def changedFolders = sh(
            script: "git diff --name-noly origin/main...HEAD | cut -d/ -f1 | sort -u",
            returnStdout: true
            ).trim().split("\n")

          echo "Changes folders: ${changesFolders}"

          for (folder in changedFolders) {
            def pipelineFile = "${folder}/Jenkinsfile"
            if (fileExists(pipelineFile)) {
              echo "Running pipeline in ${pipelineFile}"
              load(pipelineFile).call()
            }
            else {
              echo "No Jenkinsfile in ${folder}, skipping..."
            }
          }
        }
      }
    }
  }
}
