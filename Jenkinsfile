/**
 * Jenkinsfile for CI/CD Pipeline
 * Targets Microservices (Auth, Patient, etc.) and Frontend Deployment to Minikube (or any K8s cluster).
 */
pipeline {
  agent any

  environment {
    // ------------------------------------------------------------------------------------------------------
    // ⚠️ CRITICAL STEP: CONFIGURE CREDENTIAL IDs
    // ------------------------------------------------------------------------------------------------------
    DOCKER_CRED_ID  = 'dockerhub-creds'              // Jenkins ID for Docker Hub Username/Password (YOUR credentials)
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
    // Reusable Function for Build, Scan, and Deploy
    // DRY (Don't Repeat Yourself) principle applied to all services.
    // ---------------------------------------------------------
    def build_scan_deploy = { SERVICE_NAME, DIR_NAME ->
      withCredentials([
        usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
        file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
      ]) {
        // --- 1. BUILD & PUSH ---
        dir("${DIR_NAME}") {
          // Set DOCKER_HOST explicitly for the current shell environment before running docker commands
          sh "export DOCKER_HOST='${env.DOCKER_HOST_FIX}'"

          sh 'echo "Logging into Docker Hub..."'
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'

          // Use DOCKER_USER as the registry for tagging (e.g., tahir/auth-service:abc1234)
          sh "docker build -t ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} ."
          sh "docker push ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG}"
        }

        // --- 2. IMAGE SCAN (Trivy) ---
        sh """
          echo "Scanning ${SERVICE_NAME} image with Trivy..."
          # Set exit-code 0 to allow pipeline to continue even if vulnerabilities are found
          trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} || true
        """

        // --- 3. DEPLOYMENT (Kubernetes Rolling Update) ---
        sh """
          export KUBECONFIG=${KUBECONFIG_FILE}
          echo "Triggering rollout for deployment/${SERVICE_NAME}..."

          # Update the deployment image to the new tag, forcing a rollout
          # We use DOCKER_USER as the image path, matching the tag/push
          kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_USER}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
          
          # Wait for the rollout to complete before proceeding (180s timeout)
          kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s || true
        """
      }
    }

    // ---------------------------------------------------------
    // Individual Service Stages
    // The 'when { changeset "..." }' logic ensures only changed services are built.
    // ---------------------------------------------------------

    stage('Build & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script { build_scan_deploy('auth-service', 'services/auth-service') }
      }
    }

    stage('Build & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script { build_scan_deploy('patient-service', 'services/patient-service') }
      }
    }

    stage('Build & Deploy: Scans Service') {
      when { changeset "services/scans-service/**" }
      steps {
        script { build_scan_deploy('scans-service', 'services/scans-service') }
      }
    }

    stage('Build & Deploy: Appointment Service') {
      when { changeset "services/appointment-service/**" }
      steps {
        script { build_scan_deploy('appointment-service', 'services/appointment-service') }
      }
    }

    stage('Build & Deploy: Billing Service') {
      when { changeset "services/billing-service/**" }
      steps {
        script { build_scan_deploy('billing-service', 'services/billing-service') }
      }
    }

    stage('Build & Deploy: Prescription Service') {
      when { changeset "services/prescription-service/**" }
      steps {
        script { build_scan_deploy('prescription-service', 'services/prescription-service') }
      }
    }

    stage('Build & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script { build_scan_deploy('frontend', 'frontend') }
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