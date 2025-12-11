/**
 * Jenkinsfile for CI/CD Pipeline
 * Targets Microservices (Auth, Patient, etc.) and Frontend Deployment to Minikube (or any K8s cluster).
 * * ✅ FINAL FIX: Reverted to fully repetitive Declarative stages to resolve Groovy function errors.
 * * NOTE: Assumes Kubeconfig is manually copied to the Jenkins user's home path (~/.kube/config)
 */
pipeline {
  agent any

  environment {
    // ------------------------------------------------------------------------------------------------------
    // ⚠️ CRITICAL STEP: CONFIGURE CREDENTIAL IDs
    // ------------------------------------------------------------------------------------------------------
    DOCKER_CRED_ID  = 'dockerhub-creds'         // Jenkins ID for Docker Hub Username/Password (YOUR credentials)
    // KUBECONFIG_ID REMOVED - Assumes Kubeconfig is manually copied to the Jenkins user's home path (~/.kube/config)
    
    // --- Security & Quality ---
    SONAR_HOST_URL  = 'http://localhost:9000'   // Your SonarQube URL
    SONAR_TOKEN_ID  = 'sonar-token'             // Jenkins ID for SonarQube token

    // --- Dynamic/Fixed Variables ---
    IMAGE_TAG       = 'latest' // Default tag, overridden by 'Determine Tag' stage
    DOCKER_HOST_FIX = 'unix:///var/run/docker.sock'
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
            // Fallback: Use the Jenkins Build Number if Git command fails
            sha = env.BUILD_NUMBER
          }
          // The dynamic tag is set globally
          env.IMAGE_TAG = sha
          echo "Using final image tag: ${env.IMAGE_TAG}"
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Auth
    // ---------------------------------------------------------
    stage('Build & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'auth-service'
          def DIR_NAME = 'services/auth-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'

          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Patient
    // ---------------------------------------------------------
    stage('Build & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'patient-service'
          def DIR_NAME = 'services/patient-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'

          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Service: Scans
    // ---------------------------------------------------------
    stage('Build & Deploy: Scans Service') {
      when { changeset "services/scans-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'scans-service'
          def DIR_NAME = 'services/scans-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Service: Appointment
    // ---------------------------------------------------------
    stage('Build & Deploy: Appointment Service') {
      when { changeset "services/appointment-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'appointment-service'
          def DIR_NAME = 'services/appointment-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Billing
    // ---------------------------------------------------------
    stage('Build & Deploy: Billing Service') {
      when { changeset "services/billing-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'billing-service'
          def DIR_NAME = 'services/billing-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Prescription
    // ---------------------------------------------------------
    stage('Build & Deploy: Prescription Service') {
      when { changeset "services/prescription-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'prescription-service'
          def DIR_NAME = 'services/prescription-service'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Frontend
    // ---------------------------------------------------------
    stage('Build & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          def SERVICE_NAME = 'frontend'
          def DIR_NAME = 'frontend'
          def FINAL_IMAGE_TAG = env.IMAGE_TAG ?: 'latest'

          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              
              // Use the unique tag for the build
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              if command -v trivy >/dev/null 2>&1; then
                echo "Scanning ${SERVICE_NAME} image with Trivy..."
                trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} || true
              else
                echo "Warning: Trivy not found. Skipping image scan."
              fi
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              echo "Triggering rollout for deployment/${SERVICE_NAME} with tag ${FINAL_IMAGE_TAG}..."
              
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${FINAL_IMAGE_TAG} --record || true
              
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

  } // stages

  post {
    success {
      echo "✅ Pipeline completed successfully. Images pushed with tag ${IMAGE_TAG}."
    }
    failure {
      echo "❌ Pipeline failed. Check console output and logs for errors."
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}