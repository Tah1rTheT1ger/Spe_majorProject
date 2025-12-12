/**
 * Jenkinsfile — FINAL DEPLOYABLE VERSION (FULL ANSIBLE INTEGRATION & SYNTAX FIX)
 * * This version incorporates all required fixes:
 * 1. Groovy Scope Fix: Variables are defined in script {} blocks to compile correctly.
 * 2. Ansible Integration: Uses ansible-playbook for deployment (satisfies project requirement).
 * 3. Absolute Path Fix: Calculates and uses env.MANIFEST_ABS_PATH to resolve Ansible 'file not found' errors.
 */
pipeline {
  agent any

  environment {
    DOCKER_CRED_ID  = 'dockerhub-creds'
    SONAR_HOST_URL  = 'http://localhost:9000'
    SONAR_TOKEN_ID  = 'sonar-token'

    IMAGE_TAG       = 'latest' 
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

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Determine Tag') {
      steps {
        script {
          def sha = ''
          try {
            sha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          } catch (err) {
            echo "git rev-parse failed, falling back to Jenkins Build Number"
            sha = env.BUILD_NUMBER
          }
          env.IMAGE_TAG = sha
          echo "Using final image tag: ${env.IMAGE_TAG}"
        }
      }
      // Note: The 'Determine Tag' stage is deliberately the only one using 'script' for the output variable.
    }

    /* ----------------------------------------------------------
        AUTH SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "auth-service"
          env.DIR_NAME = "services/auth-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/auth-service.yaml"
          // CRITICAL: Calculate absolute path for Ansible
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          // FIX: Wrapped def in script block
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME // Export for shell access
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          // Trivy
          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          // DEPLOYMENT STEPS (Ansible integration)
          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        PATIENT SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "patient-service"
          env.DIR_NAME = "services/patient-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/patient-service.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        SCANS SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Scans Service') {
      when { changeset "services/scans-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "scans-service"
          env.DIR_NAME = "services/scans-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/scans-service.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        APPOINTMENT SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Appointment Service') {
      when { changeset "services/appointment-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "appointment-service"
          env.DIR_NAME = "services/appointment-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/appointment-service.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        BILLING SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Billing Service') {
      when { changeset "services/billing-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "billing-service"
          env.DIR_NAME = "services/billing-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/billing-service.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        PRESCRIPTION SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Prescription Service') {
      when { changeset "services/prescription-service/**" }
      steps {
        script {
          env.SERVICE_NAME = "prescription-service"
          env.DIR_NAME = "services/prescription-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/prescription-service.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("${env.DIR_NAME}") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

    /* ----------------------------------------------------------
        FRONTEND
    -----------------------------------------------------------*/

    stage('Build & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          env.SERVICE_NAME = "frontend"
          env.DIR_NAME = "frontend"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/frontend.yaml"
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME
          }

          dir("frontend") {
            sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh """
              echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
              eval \$(minikube docker-env)
              docker rmi -f ${env.FULL_IMAGE_NAME} || true
            """
            sh "docker build -t ${env.FULL_IMAGE_NAME} ."
            sh "docker push ${env.FULL_IMAGE_NAME}"
          }

          sh """
            if command -v trivy >/dev/null 2>&1; then
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
            else
              echo "Warning: Trivy not found. Skipping image scan."
            fi
          """

          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=${env.MANIFEST_ABS_PATH} service_name=${env.SERVICE_NAME}\""
        }
      }
    }

  } // end stages

  post {
    success {
      echo "✅ Pipeline completed successfully. Images pushed with tag ${env.IMAGE_TAG}."
    }
    failure {
      echo "❌ Pipeline failed. Check logs."
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}