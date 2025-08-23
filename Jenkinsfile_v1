pipeline {
  agent any
  stages {
    stage('Detect Changed Folders') {
      steps {
        script {
          def changedFolders = sh(
            script: "git diff --name-only HEAD~1 HEAD | cut -d/ -f1 | sort -u",
            returnStdout: true
          ).trim().split("\n")

          echo "Changed folders: ${changedFolders}"

          for (folder in changedFolders) {
            if (!folder?.trim()) continue

            def pipelineFile = "${folder}/Jenkinsfile"
            if (fileExists(pipelineFile)) {
              echo "Running pipeline in ${pipelineFile}"
              load(pipelineFile) // this works only if it's scripted, not declarative
            } else {
              echo "No Jenkinsfile in ${folder}, skipping..."
            }
          }
        }
      }
    }
  }
}
