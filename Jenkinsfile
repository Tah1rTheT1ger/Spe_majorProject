/**
 * Jenkinsfile — FULL FIXED VERSION
 * - KV v2 Vault path
 * - Correct Git change detection
 * - Docker login + build + push
 * - Kubernetes deployment via Ansible
 * - Trivy scan (optional)
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

        stage('Build & Deploy Services') {
            steps {
                script {
                    // List of services
                    def services = [
                        [name: 'auth-service', dir: 'services/auth-service', manifest: "${K8S_MANIFEST_DIR}/auth-service.yaml"],
                        [name: 'patient-service', dir: 'services/patient-service', manifest: "${K8S_MANIFEST_DIR}/patient-service.yaml"],
                        [name: 'scans-service', dir: 'services/scans-service', manifest: "${K8S_MANIFEST_DIR}/scans-service.yaml"],
                        [name: 'appointment-service', dir: 'services/appointment-service', manifest: "${K8S_MANIFEST_DIR}/appointment-service.yaml"],
                        [name: 'billing-service', dir: 'services/billing-service', manifest: "${K8S_MANIFEST_DIR}/billing-service.yaml"],
                        [name: 'prescription-service', dir: 'services/prescription-service', manifest: "${K8S_MANIFEST_DIR}/prescription-service.yaml"],
                        [name: 'frontend', dir: 'frontend', manifest: "${K8S_MANIFEST_DIR}/frontend.yaml"]
                    ]

                    // Function to detect if a service changed in this build
                    def hasChanges = { serviceDir ->
                        def changed = false
                        for (changeSet in currentBuild.changeSets) {
                            for (entry in changeSet.items) {
                                for (file in entry.affectedFiles) {
                                    if (file.path.startsWith(serviceDir + '/')) {
                                        changed = true
                                        break
                                    }
                                }
                                if (changed) break
                            }
                            if (changed) break
                        }
                        return changed
                    }

                    // Loop over services
                    for (svc in services) {
                        if (hasChanges(svc.dir)) {
                            echo "➡ Building & Deploying ${svc.name}"

                            // Vault secrets
                            withVault([
                                vaultSecrets: [[
                                    path: 'secret/data/jenkins/docker',
                                    engineVersion: 2,
                                    secretValues: [
                                        [vaultKey: 'username', envVar: 'DOCKER_USER_RAW'],
                                        [vaultKey: 'password', envVar: 'DOCKER_PASS']
                                    ],
                                    credentialsId: VAULT_SECRET_ID_CREDS
                                ]]
                            ]) {

                                env.DOCKER_USER = env.DOCKER_USER_RAW.trim()
                                env.FULL_IMAGE_NAME = "${env.DOCKER_USER}/${svc.name}:${IMAGE_TAG}"
                                env.MANIFEST_ABS_PATH = sh(script: "pwd", returnStdout: true).trim() + "/${svc.manifest}"

                                dir(svc.dir) {
                                    if (svc.name != 'frontend') {
                                        sh "npm test"
                                    }
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

                                // Optional: Trivy scan
                                sh """
                                    if command -v trivy >/dev/null 2>&1; then
                                        trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 \$FULL_IMAGE_NAME || true
                                    else
                                        echo "Warning: Trivy not found. Skipping image scan."
                                    fi
                                """

                                // Replace image placeholder and deploy
                                sh "sed -i 's|${K8S_IMAGE_PLACEHOLDER}|${IMAGE_TAG}|g' \$MANIFEST_ABS_PATH"
                                sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e \"manifest_file=\$MANIFEST_ABS_PATH service_name=${svc.name}\""
                            }

                        } else {
                            echo "⏭ Skipping ${svc.name}, no changes detected."
                        }
                    }
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
