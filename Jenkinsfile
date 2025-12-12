/**
 * Jenkinsfile — FINAL VERSION (NATIVE KUBECTL DEPLOYMENT)
 * FIX: Replaced Ansible deployment step with direct kubectl commands to resolve "file not found" errors.
 */
pipeline {
  agent any

  environment {
    DOCKER_CRED_ID  = 'dockerhub-creds'
    SONAR_HOST_URL  = 'http://localhost:9000'
    SONAR_TOKEN_ID  = 'sonar-token'

    // This is set to the determined SHA/Build Number in the 'Determine Tag' stage
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
            // Use short Git SHA for a stable, unique tag based on the commit
            sha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          } catch (err) {
            echo "git rev-parse failed, falling back to Jenkins Build Number"
            // Fallback: BUILD_NUMBER is an implicit environment variable
            sha = env.BUILD_NUMBER
          }
          // Set the global environment variable IMAGE_TAG
          env.IMAGE_TAG = sha
          echo "Using final image tag: ${IMAGE_TAG}"
        }
      }
    }

    /* ----------------------------------------------------------
        AUTH SERVICE
    -----------------------------------------------------------*/

    stage('Build & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          def SERVICE_NAME = "auth-service"
          def DIR_NAME = "services/auth-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/auth-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            // Trivy
            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "patient-service"
          def DIR_NAME = "services/patient-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/patient-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "scans-service"
          def DIR_NAME = "services/scans-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/scans-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "appointment-service"
          def DIR_NAME = "services/appointment-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/appointment-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "billing-service"
          def DIR_NAME = "services/billing-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/billing-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"stage('Build & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          def SERVICE_NAME = "frontend"
          def DIR_NAME = "frontend"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/frontend.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
        }
      }
    }
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "prescription-service"
          def DIR_NAME = "services/prescription-service"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/prescription-service.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
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
          def SERVICE_NAME = "frontend"
          def DIR_NAME = "frontend"
          def MANIFEST_FILE = "${K8S_MANIFEST_DIR}/frontend.yaml"

          withCredentials([
            usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"

            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // 🚀 NEW DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' ${MANIFEST_FILE}"
            sh "kubectl apply -f ${MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${SERVICE_NAME}"
          }
        }
      }
    }

  } // end stages

  post {
    success {
      echo "✅ Pipeline completed successfully. Images pushed with tag ${IMAGE_TAG}."
    }
    failure {
      echo "❌ Pipeline failed. Check logs."
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}