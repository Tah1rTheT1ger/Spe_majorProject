pipeline {
  agent any

  environment {
    VAULT_ADDR = 'http://127.0.0.1:8200'
    VAULT_SECRET_ID_CREDS = 'full-vault-approle-config'

    IMAGE_TAG = 'latest'
    DOCKER_HOST_FIX = 'unix:///var/run/docker.sock'

    K8S_IMAGE_PLACEHOLDER = 'PLACEHOLDER'
    K8S_MANIFEST_DIR = 'k8s'
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '15'))
  }

  stages {

    /* ===================== AUTH SERVICE ===================== */

    stage('Build & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {

        script {
          SERVICE_NAME = "auth-service"
          DIR_NAME = "services/auth-service"
          MANIFEST_FILE = "k8s/auth-service.yaml"
          MANIFEST_ABS_PATH = "${pwd()}/${MANIFEST_FILE}"
        }

        withVault([
          vaultSecrets: [[
            path: 'secret/jenkins/docker',
            engineVersion: 2,
            secretValues: [
              [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
              [vaultKey: 'password', envVar: 'DOCKER_PASS']
            ]
          ]],
          credentialsId: VAULT_SECRET_ID_CREDS
        ]) {

          script {
            DOCKER_USER = DOCKER_USER_RAW.trim()
            FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
          }

          dir(DIR_NAME) {
            sh """
              npm test
              export DOCKER_HOST=${DOCKER_HOST_FIX}
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
              eval \$(minikube docker-env)
              docker rmi -f $FULL_IMAGE_NAME || true
              docker build -t $FULL_IMAGE_NAME .
              docker push $FULL_IMAGE_NAME
            """
          }

          sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${MANIFEST_ABS_PATH} service_name=${SERVICE_NAME}\""
        }
      }
    }

    /* ===================== PATIENT SERVICE ===================== */

    stage('Build & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {

        script {
          SERVICE_NAME = "patient-service"
          DIR_NAME = "services/patient-service"
          MANIFEST_FILE = "k8s/patient-service.yaml"
          MANIFEST_ABS_PATH = "${pwd()}/${MANIFEST_FILE}"
        }

        withVault([
          vaultSecrets: [[
            path: 'secret/jenkins/docker',
            engineVersion: 2,
            secretValues: [
              [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
              [vaultKey: 'password', envVar: 'DOCKER_PASS']
            ]
          ]],
          credentialsId: VAULT_SECRET_ID_CREDS
        ]) {

          script {
            DOCKER_USER = DOCKER_USER_RAW.trim()
            FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
          }

          dir(DIR_NAME) {
            sh """
              npm test
              export DOCKER_HOST=${DOCKER_HOST_FIX}
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
              eval \$(minikube docker-env)
              docker rmi -f $FULL_IMAGE_NAME || true
              docker build -t $FULL_IMAGE_NAME .
              docker push $FULL_IMAGE_NAME
            """
          }

          sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${MANIFEST_ABS_PATH} service_name=${SERVICE_NAME}\""
        }
      }
    }

    /* ===================== FRONTEND ===================== */

    stage('Build & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {

        script {
          SERVICE_NAME = "frontend"
          DIR_NAME = "frontend"
          MANIFEST_FILE = "k8s/frontend.yaml"
          MANIFEST_ABS_PATH = "${pwd()}/${MANIFEST_FILE}"
        }

        withVault([
          vaultSecrets: [[
            path: 'secret/jenkins/docker',
            engineVersion: 2,
            secretValues: [
              [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
              [vaultKey: 'password', envVar: 'DOCKER_PASS']
            ]
          ]],
          credentialsId: VAULT_SECRET_ID_CREDS
        ]) {

          script {
            DOCKER_USER = DOCKER_USER_RAW.trim()
            FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
          }

          dir(DIR_NAME) {
            sh """
              export DOCKER_HOST=${DOCKER_HOST_FIX}
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
              eval \$(minikube docker-env)
              docker rmi -f $FULL_IMAGE_NAME || true
              docker build -t $FULL_IMAGE_NAME .
              docker push $FULL_IMAGE_NAME
            """
          }

          sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${MANIFEST_ABS_PATH} service_name=${SERVICE_NAME}\""
        }
      }
    }

  }

  post {
    success {
      echo "✅ Pipeline completed successfully"
    }
    failure {
      echo "❌ Pipeline failed"
    }
    always {
      echo "Pipeline finished at ${new Date()}"
    }
  }
}
