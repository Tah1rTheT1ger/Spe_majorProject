/**
 * Jenkinsfile — FULL WORKING VERSION (KV v2 + SAFE DOCKER LOGIN)
 * * Vault KV v2 path fixed: 'secret/data/jenkins/docker'
 * * Docker login handled securely with env injection
 * * Supports multiple microservices and frontend
 */

pipeline {
  agent any

  environment {
    // Vault configuration
    VAULT_ROLE_ID          = 'dcc579e4-a0f2-4de1-3aef-0a453b320860'
    VAULT_SECRET_ID_CREDS  = 'full-vault-approle-config'
    VAULT_URL              = 'http://127.0.0.1:8200'

    // Docker & build variables
    IMAGE_TAG              = 'latest'
    DOCKER_HOST_FIX        = 'unix:///var/run/docker.sock'
    K8S_IMAGE_PLACEHOLDER  = 'PLACEHOLDER'
    K8S_MANIFEST_DIR       = 'k8s'
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '15'))
  }

  stages {

    // ------------------------------
    // Helper function for each service
    // ------------------------------
    stage('Build & Deploy Services') {
      steps {
        script {

          def services = [
            [name: 'auth-service',        dir: 'services/auth-service',        manifest: 'auth-service.yaml'],
            [name: 'patient-service',     dir: 'services/patient-service',     manifest: 'patient-service.yaml'],
            [name: 'scans-service',       dir: 'services/scans-service',       manifest: 'scans-service.yaml'],
            [name: 'appointment-service', dir: 'services/appointment-service', manifest: 'appointment-service.yaml'],
            [name: 'billing-service',     dir: 'services/billing-service',     manifest: 'billing-service.yaml'],
            [name: 'prescription-service',dir: 'services/prescription-service',manifest: 'prescription-service.yaml'],
            [name: 'frontend',            dir: 'frontend',                     manifest: 'frontend.yaml']
          ]

          for (svc in services) {

            if (currentBuild.changeSets.any { cs -> cs.files.any { it.path.startsWith("${svc.dir}/") } }) {
              echo "➡ Building & deploying ${svc.name}"

              env.SERVICE_NAME      = svc.name
              env.DIR_NAME          = svc.dir
              env.MANIFEST_FILE     = "${env.K8S_MANIFEST_DIR}/${svc.manifest}"
              env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"

              withVault([
                vaultSecrets: [
                  [
                    // KV v2 path
                    path: 'secret/data/jenkins/docker',
                    secretValues: [
                      [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                      [vaultKey: 'password', envVar: 'DOCKER_PASS']
                    ],
                    credentialsId: env.VAULT_SECRET_ID_CREDS
                  ]
                ]
              ]) {

                env.DOCKER_USER      = env.DOCKER_USER_RAW.trim()
                env.FULL_IMAGE_NAME  = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"

                dir(env.DIR_NAME) {

                  if (svc.name != 'frontend') {
                    sh 'npm test'
                  }

                  // Safe Docker login
                  sh script: '''
                    export DOCKER_HOST="$DOCKER_HOST_FIX"
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                  ''', env: [
                    'DOCKER_USER': env.DOCKER_USER,
                    'DOCKER_PASS': env.DOCKER_PASS,
                    'DOCKER_HOST_FIX': env.DOCKER_HOST_FIX
                  ]

                  sh """
                    echo "Removing stale image if exists..."
                    eval \$(minikube docker-env)
                    docker rmi -f \$FULL_IMAGE_NAME || true
                    docker build -t \$FULL_IMAGE_NAME .
                    docker push \$FULL_IMAGE_NAME
                  """
                }

                // Optional Trivy scan
                sh """
                  if command -v trivy >/dev/null 2>&1; then
                    trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
                  else
                    echo "Trivy not found. Skipping scan."
                  fi
                """

                sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
                sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
              }

            } else {
              echo "⏭ Skipping ${svc.name}, no changes detected."
            }
          }
        }
      }
    }

  } // stages

  post {
    success {
      echo "✅ Pipeline completed successfully. All images pushed with tag ${env.IMAGE_TAG}."
    }
    failure {
      echo "❌ Pipeline failed. Check logs for details."
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}
