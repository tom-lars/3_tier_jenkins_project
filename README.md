# 3-Tier Application Deployment Guide

This repository contains a complete 3-tier web application with a frontend (Nginx), backend (Node.js), and database (PostgreSQL), along with the necessary configuration for deploying to Kubernetes (EKS) using Jenkins.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Deployment to EKS](#deployment-to-eks)
- [Jenkins Pipeline Configuration](#jenkins-pipeline-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### Frontend (Presentation Tier)
- HTML/CSS/JavaScript application served by Nginx
- Proxies API requests to the backend
- Includes a form for message submission and message display

### Backend (Application Tier)
- Node.js Express API
- RESTful endpoints for CRUD operations
- Database connection handling
- Error handling and logging

### Database (Data Tier)
- PostgreSQL database
- Persistent storage for all application data
- Includes a "messages" table for storing user submissions

## Prerequisites

### Local Development
- Docker and Docker Compose
- Node.js (v14+) and npm (optional, for local backend development)

### Deployment to EKS
- Amazon EKS cluster
- kubectl configured for your EKS cluster
- Jenkins server with:
  - Docker installed
  - kubectl installed
  - Necessary plugins (Docker, Kubernetes)
  - Access to push to DockerHub

## Local Development Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/three-tier-app.git
cd three-tier-app
```

### Directory Structure

Ensure your repository has the following structure:

```
.
├── frontend/
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── k8s-manifests.yaml
└── Jenkinsfile
```

### Running Locally with Docker Compose

1. Start all services:

```bash
docker-compose up -d
```

2. Access the application:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000/api/messages

3. Stop all services:

```bash
docker-compose down
```

### Development Workflow

#### Frontend Development

1. Modify files in the `frontend` directory
2. Rebuild and restart the frontend container:

```bash
docker-compose up -d --build frontend
```

#### Backend Development

1. Modify files in the `backend` directory
2. Rebuild and restart the backend container:

```bash
docker-compose up -d --build backend
```

## Deployment to EKS

### Manual Deployment

1. Build and push the Docker images:

```bash
# Login to DockerHub
docker login

# Build and push frontend
cd frontend
docker build -t yourusername/three-tier-frontend:latest .
docker push yourusername/three-tier-frontend:latest

# Build and push backend
cd ../backend
docker build -t yourusername/three-tier-backend:latest .
docker push yourusername/three-tier-backend:latest
```

2. Apply Kubernetes manifests:

```bash
# Replace placeholders in the manifest
sed 's/${DOCKER_USERNAME}/yourusername/g; s/${IMAGE_TAG}/latest/g' k8s-manifests.yaml > k8s-processed.yaml

# Apply to your cluster
kubectl apply -f k8s-processed.yaml
```

3. Check deployment status:

```bash
kubectl get pods -n three-tier-app
kubectl get services -n three-tier-app
```

4. Access the application:

```bash
# Get the LoadBalancer URL
kubectl get service frontend -n three-tier-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Jenkins Pipeline Configuration

### Jenkins Prerequisites

1. Install required plugins:
   - Docker Pipeline
   - Kubernetes CLI
   - Credentials Binding

2. Set up required credentials:
   - `DOCKER_USERNAME`: DockerHub username
   - `DOCKER_PASSWORD`: DockerHub password
   - `eks-kubeconfig`: Your EKS kubeconfig file (secret file type)

### Setting Up the Pipeline

1. Create a new Pipeline job in Jenkins
2. Configure it to use your Git repository
3. Set the script path to `Jenkinsfile`

### Pipeline Stages

The Jenkins pipeline consists of the following stages:

1. **Checkout**: Clones the repository
2. **Build Backend**: Builds the backend Docker image
3. **Build Frontend**: Builds the frontend Docker image
4. **Push to DockerHub**: Authenticates and pushes images to DockerHub
5. **Deploy to EKS**: Deploys the application to your EKS cluster

### Running the Pipeline

1. Click "Build Now" in the Jenkins job
2. Monitor pipeline execution
3. On successful completion, the pipeline will output the URL to access your application

## Monitoring and Maintenance

### Checking Application Status

```bash
# View all resources
kubectl get all -n three-tier-app

# Check pods
kubectl get pods -n three-tier-app

# Check logs for a specific pod
kubectl logs <pod-name> -n three-tier-app
```

### Scaling the Application

```bash
# Scale frontend
kubectl scale deployment frontend -n three-tier-app --replicas=5

# Scale backend
kubectl scale deployment backend -n three-tier-app --replicas=5
```

### Updating the Application

1. Make changes to your code
2. Commit and push to your repository
3. Run the Jenkins pipeline again to deploy the updates

## Troubleshooting

### Common Issues

#### Pod Startup Failures

Check pod status and logs:

```bash
kubectl describe pod <pod-name> -n three-tier-app
kubectl logs <pod-name> -n three-tier-app
```

#### Database Connection Issues

Verify database service:

```bash
kubectl get service postgres -n three-tier-app
```

Check backend logs for connection errors:

```bash
kubectl logs -l app=backend -n three-tier-app
```

#### LoadBalancer Not Resolving

Check service status:

```bash
kubectl describe service frontend -n three-tier-app
```

#### Jenkins Pipeline Failures

1. Check that all credentials are correctly configured
2. Verify that Jenkins has the required tools installed
3. Check network connectivity between Jenkins and your EKS cluster

### Getting Help

If you encounter issues not covered here:

1. Check the logs for specific error messages
2. Review Kubernetes and Docker documentation for specific errors
3. Open an issue in the repository with detailed information about the problem

## License

[MIT License](LICENSE)