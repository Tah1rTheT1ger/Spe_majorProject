# 🏥 Medical ERP System

> A cloud-native, microservices-based Enterprise Resource Planning system for healthcare facilities, built with **DevOps** best practices in mind.

![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![ElasticStack](https://img.shields.io/badge/Elastic-%23005571.svg?style=for-the-badge&logo=elasticsearch&logoColor=white)
![Ansible](https://img.shields.io/badge/ansible-%231A1918.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Vault](https://img.shields.io/badge/vault-%23CA391D.svg?style=for-the-badge&logo=vault&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

---

## 📖 Overview

This project is a comprehensive Medical ERP solution designed to manage various hospital operations. It is architected as a **distributed microservices application**, ensuring scalability, fault tolerance, and ease of deployment. 

The infrastructure leverages modern Cloud-Native technologies, including **Kubernetes** for orchestration, **Jenkins** for CI/CD, **ELK Stack** for observability, and **HashiCorp Vault** for secret management.

## 🏗 Architecture

The system is composed of the following loosely coupled microservices:

*   **🛡️ Auth Service**: Handles user registration, login, and JWT-based authentication.
*   **👤 Patient Service**: Manages patient records, history, and demographics.
*   **📅 Appointment Service**: Scheduling and management of doctor appointments.
*   **🧾 Billing Service**: Invoice generation and payment tracking.
*   **💊 Prescription Service**: Digital prescription management for doctors.
*   **🩻 Scans Service**: Management of radiology and lab scan records.
*   **💻 Frontend**: A modern React-based Single Page Application (SPA) served via Nginx.

## 🛠 Tech Stack & Tools

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Vite (or Create React App), Nginx |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Replica Set / Standalone) |
| **Orchestration** | Kubernetes (Minikube/Cloud) |
| **CI/CD** | Jenkins (Pipeline as Code) |
| **Configuration** | Ansible |
| **Secret Mgmt** | HashiCorp Vault |
| **Observability** | Elasticsearch, Filebeat, Kibana (ELK) |
| **Registry** | Docker Hub |

## 🚀 Getting Started

### Prerequisites
*   Docker & Minikube installed.
*   `kubectl` configured.
*   Node.js (for local development).

### 🔧 Installation & Deployment

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Tah1rTheT1ger/Spe_majorProject.git
    cd Spe_majorProject
    ```

2.  **Start Kubernetes Cluster**
    ```bash
    minikube start
    ```

3.  **Bootstrapping the Cluster**
    Review the `k8s/` directory and apply the manifests.
    ```bash
    kubectl apply -f k8s/
    ```

4.  **Local Access (Port Forwarding)**
    Use the included script to easily access internal services (Mongo, Vault, Kibana, etc.) from your local machine.
    ```bash
    ./start_dev_tunnels.sh
    ```
    *   **Frontend**: http://localhost:3000
    *   **Kibana**: http://localhost:5601
    *   **Vault**: http://localhost:8200

## 🔃 CI/CD Pipeline

This project uses a robust **Jenkins Declarative Pipeline** (`Jenkinsfile`) that automates:

1.  **Checkout**: Pulls code from GitHub.
2.  **Secrets**: Retrieves Docker credentials dynamically from **Vault**.
3.  **Build**: Creates Docker images for changed services.
4.  **Test**: Runs unit tests (`npm test`).
5.  **Scan**: Security scanning (Trivy).
6.  **Push**: Pushes artifacts to Docker Hub.
7.  **Deploy**: Uses **Ansible** to trigger rolling updates on Kubernetes.

## 📊 Monitoring & Logging

*   **ELK Stack**: Centralized logging.
    *   **Filebeat**: Harvests container logs and enrichs them with Kubernetes metadata.
    *   **Elasticsearch**: Stores and indexes logs.
    *   **Kibana**: Visualises application logs (HTTP 200/500, Latency, etc.).

## 🔐 Security

*   **Secrets**: All sensitive keys (API tokens, DB credentials) are managed by **HashiCorp Vault** and injected into pods at runtime via Kubernetes Secrets or Agent Injectors.
*   **RBAC**: Role-Based Access Control is implemented within the application (Doctor vs. Patient vs. Desk Staff).

---

### 👨‍💻 Author
**Tahir** - *DevOps Engineer & Full Stack Developer*
**Adarsha** - *Also a DevOps Engineer & Full Stack Developer*
