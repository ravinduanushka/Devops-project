# Kubernetes Manifests for Hospital Management System

This directory contains the Kubernetes manifests to deploy the entire application on any Kubernetes cluster (Minikube, Kind, AWS EKS, GKE, or Azure AKS).

## Architecture

- **`mongodb-deployment.yaml`**: PersistentVolumeClaim (1Gi), MongoDB Deployment, and `mongodb-service` (ClusterIP).
- **`server-deployment.yaml`**: Server ConfigMap (with credentials & environment variables), Server Deployment (2 replicas for High Availability), and `server-service` (ClusterIP).
- **`client-deployment.yaml`**: Client Deployment (2 replicas), and `client-service` (NodePort on port `30080` / `3000`).

## How to Deploy

### 1. Build and tag the Docker images (if using local cluster like Minikube)
```bash
docker build -t hospital-server:latest ./server
docker build -t hospital-client:latest ./client
```

*(If using Minikube, run `eval $(minikube docker-env)` before building so Minikube can see your local images, or run `minikube image load hospital-server:latest && minikube image load hospital-client:latest`)*.

### 2. Apply all Kubernetes manifests
```bash
kubectl apply -k k8s/
# OR
kubectl apply -f k8s/
```

### 3. Verify Pods and Services
```bash
kubectl get pods
kubectl get services
```

### 4. Access the Application
- On **Minikube**:
  ```bash
  minikube service client-service
  ```
- On **Standard NodePort**:
  Visit `http://<Node-IP>:30080` in your web browser.

### 5. Tear Down / Delete Deployment
```bash
kubectl delete -k k8s/
# OR
kubectl delete -f k8s/
```
