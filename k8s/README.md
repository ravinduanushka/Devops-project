# Kubernetes Manifests for Hospital Management System

This directory contains the Kubernetes manifests to deploy the entire application on any Kubernetes cluster (Minikube, Kind, AWS EKS, GKE, or Azure AKS).

## Architecture

- **`mongodb-deployment.yaml`**: PersistentVolumeClaim (1Gi), MongoDB Deployment, and `mongodb-service` (ClusterIP).
- **`server-deployment.yaml`**: Server ConfigMap (with credentials & environment variables), Server Deployment (2 replicas for High Availability), and `server` (ClusterIP). The service name matches the `http://server:5000` upstream in the frontend's Nginx configuration, as it does in Docker Compose.
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

Check that the `server` service has backend endpoints and that the frontend can reach it:

```bash
kubectl get endpointslices -l kubernetes.io/service-name=server
kubectl exec deployment/client-deployment -- wget -qO- http://localhost/health
```

The health request should return JSON containing `"status":"UP"`.
If upgrading an older deployment, applying these manifests creates the `server` service.
The previous `server-service` may remain; remove it after verifying that no other clients use it.
If frontend pods previously failed to start because the upstream could not be resolved, restart them after applying:

```bash
kubectl rollout restart deployment/client-deployment
kubectl rollout status deployment/client-deployment
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
