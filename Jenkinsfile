pipeline {
  agent any
  stages {
            stage('Detect and Run Pipelines') {
            steps {  
                script {
                    // Get changed folders at 2 levels (e.g., node-folder/app1)
                    def changedFolders = sh(
                        script: 'git diff --name-only origin/main...HEAD | awk -F/ \'{print $1"/"$2}\' | sort -u',
                        returnStdout: true
                    ).trim().split("\n")

                    echo "Changed folders: ${changedFolders}"

                    for (folder in changedFolders) {
                        // Special case: root-level folders like web-app
                        def possiblePaths = ["${folder}/Jenkinsfile", "${folder?.split('/')?.getAt(0)}/Jenkinsfile"]

                        def found = false

                        for (path in possiblePaths) {
                            if (fileExists(path)) {
                                echo "Found Jenkinsfile: ${path}"
                                load(path).call()
                                found = true
                                break
                            }
                        }

                        if (!found) {
                            echo "No Jenkinsfile found for ${folder}, skipping..."
                        }
                    }
                }
      
             }
        }
    }
}
