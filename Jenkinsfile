/**
 * Jenkinsfile — FINAL DEPLOYABLE VERSION (LAST SCOPE FIX)
 * FIX: Replaced 'def FULL_IMAGE_NAME' inside withCredentials with a nested 'withEnv' block 
 * to correctly define the variable as an executable step, resolving the persistent compilation errors.
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
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          // FIX: Use withEnv to define the complex image name as a legal step
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {

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

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
          env.SERVICE_NAME = "patient-service"
          env.DIR_NAME = "services/patient-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/patient-service.yaml"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {
          
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

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
          env.SERVICE_NAME = "scans-service"
          env.DIR_NAME = "services/scans-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/scans-service.yaml"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {
            
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

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
          env.SERVICE_NAME = "appointment-service"
          env.DIR_NAME = "services/appointment-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/appointment-service.yaml"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {

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

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
          env.SERVICE_NAME = "billing-service"
          env.DIR_NAME = "services/billing-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/billing-service.yaml"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {

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

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
          env.SERVICE_NAME = "prescription-service"
          env.DIR_NAME = "services/prescription-service"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/prescription-service.yaml"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          withEnv(["FULL_IMAGE_NAME=${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"]) {

            dir("${env.DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh """
                echo "Attempting to remove stale image ${env.FULL_IMAGE_NAME} from Minikube cache..."
                eval \$(minikube docker-env)
                docker rmi -f ${env.FULL_IMAGE_NAME} || true
              """
              sh "docker build -t ${env.FULL_IMAGE_NAME} ."
              sh "docker push ${FULL_IMAGE_NAME}"
            }

            sh """
              if command -v trivy >/dev/null 2>&1; then
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${env.FULL_IMAGE_NAME} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // DEPLOYMENT STEPS (kubectl)
            sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_FILE}"
            sh "kubectl apply -f ${env.MANIFEST_FILE}"
            sh "kubectl rollout restart deployment ${env.SERVICE_NAME}"
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
        // 1. Define global-like service environment variables (Correct location)
        script {
          env.SERVICE_NAME = "frontend"
          env.DIR_NAME = "frontend"
          env.MANIFEST_FILE = "${env.K8S_MANIFEST_DIR}/frontend.yaml"
          // CRITICAL: Calculate absolute path for Ansible/Deployment
          env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${env.MANIFEST_FILE}"
        }

        withCredentials([
          usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        ]) {
          // 🎯 FINAL FIX: Wrap the 'def' statement in a 'script' block 
          // This makes the definition a legal executable step.
          script {
            def FULL_IMAGE_NAME = "${DOCKER_USER}/${env.SERVICE_NAME}:${env.IMAGE_TAG}"
            env.FULL_IMAGE_NAME = FULL_IMAGE_NAME // Export to environment for shell access
          }

          dir("${env.DIR_NAME}") {
            // Build & Push Steps
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

          // DEPLOYMENT STEPS (Ansible Integration using Absolute Path)
          // 1. Replace placeholder using the ABSOLUTE PATH
          sh "sed -i 's|${env.K8S_IMAGE_PLACEHOLDER}|${env.IMAGE_TAG}|g' ${env.MANIFEST_ABS_PATH}"
          
          // 2. Use Ansible, passing the ABSOLUTE PATH
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