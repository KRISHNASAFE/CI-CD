pipeline{
  agent any
  stages {
    stage('Detect Changed Folders') {
      steps {
        script {
          // Compare the last commit to current HEAD (or increase HEAD~1 to HEAD~N if needed)
          def changedFolders = sh(
            script: "git diff --name-only HEAD~1 HEAD | cut -d/ -f1 | sort -u",
            returnStdout: true
          ).trim().split("\n")

          echo "Changes folders: ${changedFolders}"

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
