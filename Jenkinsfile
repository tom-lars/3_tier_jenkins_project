pipeline {
    agent any
    environment {
        DOCKER_HUB_USERNAME = "your-dockerhub-username"
    }
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/your-repo.git'
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    sh "docker build -t backend:latest ./backend"
                    sh "docker tag backend:latest ${DOCKER_HUB_USERNAME}/backend:latest"
                    sh "docker login -u ${DOCKER_HUB_USERNAME} -p ${DOCKER_HUB_PASSWORD}"
                    sh "docker push ${DOCKER_HUB_USERNAME}/backend:latest"
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    sh "docker build -t frontend:latest ./frontend"
                    sh "docker tag frontend:latest ${DOCKER_HUB_USERNAME}/frontend:latest"
                    sh "docker push ${DOCKER_HUB_USERNAME}/frontend:latest"
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    sh "aws eks --region us-east-1 update-kubeconfig --name your-cluster"
                    sh "kubectl apply -f k8s/"
                }
            }
        }
    }
}
