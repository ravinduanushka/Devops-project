# Jenkins CI/CD Pipeline & Lab Setup

This directory contains the Jenkins CI/CD pipeline definition and supporting automation scripts for building, testing, and verifying the Hospital Management System (NexusHealth).

---

## Directory Structure

```
jenkins/
├── Jenkinsfile         # Declarative Jenkins pipeline script
├── scripts/            # Helper automation scripts executed during or after pipeline stages
│   ├── test.sh         # Endpoint test script (curls server /health & client frontend)
│   └── cleanup.sh      # Cleanup script (stops and removes Docker Compose containers)
└── README.md           # Instructions for lab setup & pipeline execution
```

---

## Lab Prerequisites

Before running this pipeline in Jenkins, ensure the Jenkins agent environment meets the following requirements:

1. **Jenkins Agent with Label `rootless-docker`**:
   - The pipeline specifies `agent { label 'rootless-docker' }`.
   - Ensure you have an active Jenkins agent/node configured with this label.
2. **Rootless Docker & Docker Compose**:
   - Docker daemon must be running in rootless mode on the agent.
   - `docker` and `docker compose` CLI plugins must be installed and accessible by the `jenkins` user without `sudo`.
3. **Network & Tools**:
   - `curl` installed on the agent (used by `test.sh`).
   - Access to Docker Hub to pull base images (`node:20-alpine`, `mongo:6.0`).

---

## Pipeline Overview (`Jenkinsfile`)

The pipeline automates continuous integration across 4 stages:

1. **Checkout**:
   - Checks out the latest source code from the configured Git branch (`checkout scm`).

2. **Test Backend**:
   - Mounts the `server` directory into a temporary `node:20-alpine` Docker container.
   - Installs dependencies cleanly (`npm ci`) and runs backend test suites (`npm test`) in an isolated environment without needing Node installed directly on the host.

3. **Build Docker Images**:
   - Builds all required service images (`hospital-server`, `hospital-client`, and database service) via `docker compose build`.

4. **Verify Containers**:
   - Spins up the container services in detached mode (`docker compose up -d`).
   - Waits for initialization (`sleep 5`).
   - Verifies the state of running containers with `docker compose ps`.
   - Shuts down the test environment safely using `docker compose down`.

---

## Helper Scripts

### 1. Endpoint Verification (`scripts/test.sh`)
Tests whether the application backend and frontend are responsive:
- **Backend Health Check**: Curls `http://localhost:5000/health` (expects HTTP `200`).
- **Frontend Client Check**: Curls `http://localhost:3000` (expects HTTP `200` / `304`).
- Includes automatic retry logic (up to 10 attempts).

**Manual Execution**:
```bash
chmod +x jenkins/scripts/test.sh
./jenkins/scripts/test.sh
```

### 2. Teardown & Cleanup (`scripts/cleanup.sh`)
Stops all running Docker Compose containers and cleans up orphan networks and containers.

**Manual Execution**:
```bash
chmod +x jenkins/scripts/cleanup.sh
./jenkins/scripts/cleanup.sh
```

---

## Jenkins Job Configuration Guide

1. In Jenkins dashboard, click **New Item** > select **Pipeline** > name it (e.g., `hospital-management-ci`).
2. Under **Build Triggers**, optionally select **GitHub hook trigger for GITScm polling** or configure Poll SCM.
3. In the **Pipeline** section:
   - **Definition**: Choose **Pipeline script from SCM**.
   - **SCM**: Select **Git**.
   - **Repository URL**: Enter your GitHub repository URL.
   - **Branch Specifier**: `*/main`.
   - **Script Path**: `jenkins/Jenkinsfile`.
4. Click **Save** and trigger a test build using **Build Now**.
