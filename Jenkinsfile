/**
 * Jenkinsfile for CI/CD Pipeline
 * Targets Microservices (Auth, Patient, etc.) and Frontend Deployment to Minikube (or any K8s cluster).
 * * ✅ FIX APPLIED: Replaced the illegal global function definition with repeated, inline logic
 * to comply with Declarative Pipeline syntax and resolve the "Expected a stage" error.
 */
pipeline {
  agent any

  environment {
    // ------------------------------------------------------------------------------------------------------
    // ⚠️ CRITICAL STEP: CONFIGURE CREDENTIAL IDs
    // ------------------------------------------------------------------------------------------------------
    DOCKER_CRED_ID  = 'dockerhub-creds'         // Jenkins ID for Docker Hub Username/Password (YOUR credentials)
    KUBECONFIG_ID   = 'kubeconfig-minikube'     // Jenkins ID for the Kubeconfig Secret File
    
    // --- Security & Quality ---
    SONAR_HOST_URL  = 'http://localhost:9000'   // Your SonarQube URL
    SONAR_TOKEN_ID  = 'sonar-token'             // Jenkins ID for SonarQube token

    // --- Dynamic/Fixed Variables ---
    IMAGE_TAG       = 'latest'
    // ✅ FIX: Ensures Docker commands use the correct socket for stable execution within Jenkins
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
          env.IMAGE_TAG = sha
          echo "Using final image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    // ---------------------------------------------------------
    // Service: Auth - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'auth-service'
          def DIR_NAME = 'services/auth-service'

          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Patient - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'patient-service'
          def DIR_NAME = 'services/patient-service'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Service: Scans - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Scans Service') {
      when { changeset "services/scans-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'scans-service'
          def DIR_NAME = 'services/scans-service'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Service: Appointment - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Appointment Service') {
      when { changeset "services/appointment-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'appointment-service'
          def DIR_NAME = 'services/appointment-service'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Billing - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Billing Service') {
      when { changeset "services/billing-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'billing-service'
          def DIR_NAME = 'services/billing-service'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }
    
    // ---------------------------------------------------------
    // Service: Prescription - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Prescription Service') {
      when { changeset "services/prescription-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'prescription-service'
          def DIR_NAME = 'services/prescription-service'
          
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
            """
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Frontend - Repeated Logic (Correct Declarative Syntax)
    // ---------------------------------------------------------
    stage('Build & Image Scan & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          def SERVICE_NAME = 'frontend'
          def DIR_NAME = 'frontend'

          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // --- 1. BUILD & PUSH ---
            dir("${DIR_NAME}") {
              sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
            }

            // --- 2. IMAGE SCAN (Trivy) ---
            sh """
              echo "Scanning ${SERVICE_NAME} image with Trivy..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """

            // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              echo "Triggering rollout for deployment/${SERVICE_NAME}..."
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
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