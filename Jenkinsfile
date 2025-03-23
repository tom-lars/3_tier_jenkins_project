pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = "siddocker467"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh "docker build -t ${DOCKER_USERNAME}/three-tier-backend:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_USERNAME}/three-tier-backend:${IMAGE_TAG} ${DOCKER_USERNAME}/three-tier-backend:latest"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${DOCKER_USERNAME}/three-tier-frontend:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_USERNAME}/three-tier-frontend:${IMAGE_TAG} ${DOCKER_USERNAME}/three-tier-frontend:latest"
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                sh "docker push ${DOCKER_USERNAME}/three-tier-backend:${IMAGE_TAG}"
                sh "docker push ${DOCKER_USERNAME}/three-tier-backend:latest"
                sh "docker push ${DOCKER_USERNAME}/three-tier-frontend:${IMAGE_TAG}"
                sh "docker push ${DOCKER_USERNAME}/three-tier-frontend:latest"
            }
        }
        
        stage('Deploy to EKS') {
            steps {
                sh "kubectl apply -f k8s/k8s-manifests.yaml"
                sh "kubectl rollout status deployment/frontend -n three-tier-app"
                sh "kubectl rollout status deployment/backend -n three-tier-app"
            }
        }
    }
    
    
}