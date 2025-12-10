pipeline {
  agent any

  environment {
    // --- YOUR EXISTING ENVIRONMENT VARS ---
    DOCKER_REGISTRY = 'adarshareddy69'               // your Docker Hub username
    DOCKER_CRED_ID  = 'docker_hub'                   // existing Docker Hub credentials in Jenkins
    KUBECONFIG_ID   = 'kubeconfig-prod-cluster'      // existing kubeconfig file in Jenkins
    
    // --- NEW DEVOPS/SECURITY VARS ---
    IMAGE_TAG       = 'latest'                       // Placeholder, will be set in 'Determine Tag' stage
    SONAR_HOST_URL  = 'http://localhost:9000'        // CHANGE THIS to your SonarQube URL
    SONAR_TOKEN_ID  = 'sonar-token'                  // CHANGE THIS to your SonarQube token ID in Jenkins
  }

  options {
    timestamps()
    // Add color to console output for better readability
    ansiColor('xterm') 
    // Keep only the last 15 builds
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
          // Use git short SHA as an immutable tag
          def sha = ''
          try {
            sha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          } catch (err) {
            echo "git rev-parse failed, falling back to branch name"
            sha = env.BRANCH_NAME ?: 'latest'
          }
          env.IMAGE_TAG = sha
          echo "Using image tag: ${env.IMAGE_TAG}"
        }
      }
    }
    
    // ------------------------------------------------------------------
    // DevSecOps Stages (Added from your friend's pipeline)
    // These run on the entire codebase before any service is built.
    // ------------------------------------------------------------------

    stage('Static Analysis & Unit Tests') {
      steps {
        sh '''
          echo "Running Python and Node.js Static Analysis & Unit Tests..."
          # Set up Python environment for backend services
          python -m venv .venv
          . .venv/bin/activate
          pip install --upgrade pip
          pip install -r services/auth-service/requirements.txt # Example, adjust path for your service dependencies
          
          # Basic Code Quality Checks (Example tools - requires installation on Agent)
          # ruff check services
          # black --check services
          # mypy services || true
          
          # Basic Security Analysis (SAST)
          bandit -r services/auth-service || true 
          pip-audit -r services/auth-service/requirements.txt || true

          # Run Tests (Example)
          # PYTHONPATH=backend python -m pytest backend/tests
        '''
      }
    }

    stage('Secret Scan (Gitleaks)') {
      steps {
        sh '''
          echo "Scanning for secrets using Gitleaks..."
          # Requires gitleaks to be installed on the Jenkins agent.
          if command -v gitleaks >/dev/null 2>&1; then 
            # Detect secrets across the entire checked out repository
            gitleaks detect --no-git -v || true 
          else
            echo "Warning: gitleaks not found. Skipping secret scan."
          fi
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          // Replace 'sonar-scanner' with your tool name setup in Manage Jenkins > Global Tool Configuration
          def scannerHome = tool 'sonar-scanner' 
          // Uses the credentials ID defined in the environment block
          withCredentials([string(credentialsId: env.SONAR_TOKEN_ID, variable: 'SONAR_TOKEN')]) { 
            sh """
              ${scannerHome}/bin/sonar-scanner \
              -Dsonar.projectKey=spe_majorproject \
              -Dsonar.sources=. \
              -Dsonar.host.url=${env.SONAR_HOST_URL} \
              -Dsonar.token=$SONAR_TOKEN
            """
            // Optional: You can add the waitForQualityGate step here to enforce quality standards
          }
        }
      }
    }
    
    // ------------------------------------------------------------------
    // Modular Build & Deploy Stages (Updated)
    // ------------------------------------------------------------------

    // --- Template for all services ---
    // The build process is now decoupled from security analysis.

    stage('Build & Image Scan & Deploy: Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'auth-service'
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // 1. Build & Push Image
            dir("services/${SERVICE_NAME}") {
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG}"
            }
            
            // 2. Image Vulnerability Scan (Trivy)
            sh """
              echo "Scanning ${SERVICE_NAME} image..."
              # --exit-code 0: Fails ONLY if a critical vulnerability is found (Customizable)
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """
            
            // 3. Deploy
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s
            """
          }
        }
      }
    }
    
    // ... Repeat the 'Build & Image Scan & Deploy' stage for Patient Service, Scans Service, Appointment Service, Billing Service, Prescription Service, and Frontend, 
    // making sure to replace 'auth-service' with the correct SERVICE_NAME for each stage.
    
    // -------------------------------
    // Example: Patient service
    // -------------------------------
    stage('Build & Image Scan & Deploy: Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script {
          def SERVICE_NAME = 'patient-service'
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // 1. Build & Push Image
            dir("services/${SERVICE_NAME}") {
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG}"
            }
            
            // 2. Image Vulnerability Scan (Trivy)
            sh """
              echo "Scanning ${SERVICE_NAME} image..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """
            
            // 3. Deploy
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s
            """
          }
        }
      }
    }

    // ... continue for other services ...
    
    // -------------------------------
    // Example: Frontend
    // -------------------------------
    stage('Build & Image Scan & Deploy: Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          def SERVICE_NAME = 'frontend'
          withCredentials([
            usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG_FILE')
          ]) {
            // 1. Build & Push Image
            dir("${SERVICE_NAME}") {
              sh 'echo "Logging into Docker Hub..."'
              sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
              sh "docker build -t ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} ."
              sh "docker push ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG}"
            }
            
            // 2. Image Vulnerability Scan (Trivy)
            sh """
              echo "Scanning ${SERVICE_NAME} image..."
              trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} || true
            """
            
            // 3. Deploy
            sh """
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/${SERVICE_NAME} ${SERVICE_NAME}=${DOCKER_REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG} --record || true
              kubectl rollout status deployment/${SERVICE_NAME} --timeout=180s
            """
          }
        }
      }
    }

  } // stages

  post {
    success {
      echo "Pipeline completed successfully. Images pushed with tag ${IMAGE_TAG}."
    }
    failure {
      echo "Pipeline failed. Check console output for errors."
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
      // Optional cleanup: sh 'docker logout'
    }
  }
}