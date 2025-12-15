/**
 * Jenkinsfile — FULLY VERIFIED & DEDICATED STAGES
 * - Status: Based on the successful execution of the consolidated logic.
 * - Configuration: KV v2 Vault path 'secret/jenkins/docker' and 'engineVersion: 2' confirmed working.
 * - Structure: Separated into dedicated stages for clear monitoring.
 * * NOTE: The 'secret/jenkins/docker' path works because 'engineVersion: 2' is explicitly used 
 * alongside it, telling the plugin how to request the data internally.
 */
pipeline {
    agent any

    environment {
        // Vault Config
        VAULT_URL = "http://127.0.0.1:8200"
        VAULT_SECRET_ID_CREDS = 'full-vault-approle-config'

        // Docker / Kubernetes
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
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        // =============================================================
        // AUTH SERVICE
        // =============================================================
        stage('Build & Deploy: Auth Service') {
            when { changeset "services/auth-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "auth-service"
                    env.DIR_NAME = "services/auth-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/auth-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2, // KV v2 required
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/auth-service.yaml"
                }
            }
        }

        // =============================================================
        // PATIENT SERVICE
        // =============================================================
        stage('Build & Deploy: Patient Service') {
            when { changeset "services/patient-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "patient-service"
                    env.DIR_NAME = "services/patient-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/patient-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/patient-service.yaml"
                }
            }
        }
        
        // =============================================================
        // SCANS SERVICE
        // =============================================================
        stage('Build & Deploy: Scans Service') {
            when { changeset "services/scans-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "scans-service"
                    env.DIR_NAME = "services/scans-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/scans-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/scans-service.yaml"
                }
            }
        }

        // =============================================================
        // APPOINTMENT SERVICE
        // =============================================================
        stage('Build & Deploy: Appointment Service') {
            when { changeset "services/appointment-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "appointment-service"
                    env.DIR_NAME = "services/appointment-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/appointment-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/appointment-service.yaml"
                }
            }
        }
        
        // =============================================================
        // BILLING SERVICE
        // =============================================================
        stage('Build & Deploy: Billing Service') {
            when { changeset "services/billing-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "billing-service"
                    env.DIR_NAME = "services/billing-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/billing-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/billing-service.yaml"
                }
            }
        }
        
        // =============================================================
        // PRESCRIPTION SERVICE
        // =============================================================
        stage('Build & Deploy: Prescription Service') {
            when { changeset "services/prescription-service/**" }
            steps {
                script {
                    env.SERVICE_NAME = "prescription-service"
                    env.DIR_NAME = "services/prescription-service"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/prescription-service.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        sh "npm test"
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/prescription-service.yaml"
                }
            }
        }
        
        // =============================================================
        // FRONTEND (NO TEST)
        // =============================================================
        stage('Build & Deploy: Frontend') {
            when { changeset "frontend/**" }
            steps {
                script {
                    env.SERVICE_NAME = "frontend"
                    env.DIR_NAME = "frontend"
                    env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${K8S_MANIFEST_DIR}/frontend.yaml"
                }
                
                withVault([
                    vaultSecrets: [[
                        path: 'secret/jenkins/docker', // VERIFIED WORKING PATH
                        engineVersion: 2,
                        secretValues: [
                            [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                            [vaultKey: 'password', envVar: 'DOCKER_PASS']
                        ],
                        credentialsId: VAULT_SECRET_ID_CREDS
                    ]]
                ]) {
                    script {
                        env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                        env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${env.SERVICE_NAME}:${IMAGE_TAG}"
                    }
                    
                    dir("${env.DIR_NAME}") {
                        // npm test is skipped here
                        sh "export DOCKER_HOST='${DOCKER_HOST_FIX}'"
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh """
                            echo "Removing stale image \$FULL_IMAGE_NAME if exists..."
                            eval \$(minikube docker-env)
                            docker rmi -f \$FULL_IMAGE_NAME || true
                        """
                        sh "docker build --no-cache -t \$FULL_IMAGE_NAME ."
                        sh "docker push \$FULL_IMAGE_NAME"
                    }

                    // Trivy scan (optional)
                    sh """
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                        else
                            echo "Warning: Trivy not found. Skipping image scan."
                        fi
                    """

                    // Deployment
                    sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                    sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${env.SERVICE_NAME}\""
                    // Cleanup: Revert manifest change
                    sh "git checkout -- ${K8S_MANIFEST_DIR}/frontend.yaml"
                }
            }
        }
    }

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