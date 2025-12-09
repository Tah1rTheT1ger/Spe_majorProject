pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'adarshareddy69'  // your Docker Hub username
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // Example stage for auth-service; other stages follow same pattern
    stage('Build & Deploy Auth Service') {
      when { changeset "services/auth-service/**" }
      steps {
        script {
          withCredentials([
            usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')
          ]) {
            dir('services/auth-service') {
              sh 'echo "Building auth-service..."'
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/auth-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/auth-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/auth-service auth-service=${DOCKER_REGISTRY}/auth-service:latest --record || true
              kubectl rollout status deployment/auth-service --timeout=120s
            '''
          }
        }
      }
    }

    // Repeat pattern for other services
    stage('Build & Deploy Patient Service') {
      when { changeset "services/patient-service/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('services/patient-service') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/patient-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/patient-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/patient-service patient-service=${DOCKER_REGISTRY}/patient-service:latest --record || true
              kubectl rollout status deployment/patient-service --timeout=120s
            '''
          }
        }
      }
    }

    stage('Build & Deploy Scans Service') {
      when { changeset "services/scans-service/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('services/scans-service') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/scans-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/scans-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/scans-service scans-service=${DOCKER_REGISTRY}/scans-service:latest --record || true
              kubectl rollout status deployment/scans-service --timeout=120s
            '''
          }
        }
      }
    }

    stage('Build & Deploy Appointment Service') {
      when { changeset "services/appointment-service/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('services/appointment-service') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/appointment-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/appointment-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/appointment-service appointment-service=${DOCKER_REGISTRY}/appointment-service:latest --record || true
              kubectl rollout status deployment/appointment-service --timeout=120s
            '''
          }
        }
      }
    }

    stage('Build & Deploy Billing Service') {
      when { changeset "services/billing-service/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('services/billing-service') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/billing-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/billing-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/billing-service billing-service=${DOCKER_REGISTRY}/billing-service:latest --record || true
              kubectl rollout status deployment/billing-service --timeout=120s
            '''
          }
        }
      }
    }

    stage('Build & Deploy Prescription Service') {
      when { changeset "services/prescription-service/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('services/prescription-service') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/prescription-service:latest ."
              sh "docker push ${DOCKER_REGISTRY}/prescription-service:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/prescription-service prescription-service=${DOCKER_REGISTRY}/prescription-service:latest --record || true
              kubectl rollout status deployment/prescription-service --timeout=120s
            '''
          }
        }
      }
    }

    stage('Build & Deploy Frontend') {
      when { changeset "frontend/**" }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                           file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            dir('frontend') {
              sh "echo \"$DOCKER_PASS\" | docker login -u \"$DOCKER_USER\" --password-stdin"
              sh "docker build -t ${DOCKER_REGISTRY}/frontend:latest ."
              sh "docker push ${DOCKER_REGISTRY}/frontend:latest"
            }
            sh '''
              export KUBECONFIG=${KUBECONFIG_FILE}
              kubectl set image deployment/frontend frontend=${DOCKER_REGISTRY}/frontend:latest --record || true
              kubectl rollout status deployment/frontend --timeout=120s
            '''
          }
        }
      }
    }

  } // stages

  post {
    always {
      echo "Pipeline finished. Clean up if needed."
    }
  }
}
