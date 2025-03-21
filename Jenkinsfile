pipeline {
    agent any
    environment {
        DOCKER_HUB_USERNAME = "siddocker467"
    }
    stages {
        
        stage('Build & Push Backend') {
            steps {
                script {
                    sh "docker build -t backend:${BUILD_ID} ./backend"
                    sh "docker tag backend:${BUILD_ID} ${DOCKER_HUB_USERNAME}/backend:${BUILD_ID}"
                    sh "docker tag backend:${BUILD_ID} ${DOCKER_HUB_USERNAME}/backend:latest"
                    sh "docker push ${DOCKER_HUB_USERNAME}/backend:${BUILD_ID}"
                    sh "docker push ${DOCKER_HUB_USERNAME}/backend:latest"
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    sh "chmod +x ./frontend/node_modules/.bin/react-scripts"
                    sh "docker build -t frontend:${BUILD_ID} ./frontend"
                    sh "docker tag frontend:${BUILD_ID} ${DOCKER_HUB_USERNAME}/frontend:${BUILD_ID}"
                    sh "docker tag frontend:${BUILD_ID} ${DOCKER_HUB_USERNAME}/frontend:latest"
                    sh "docker push ${DOCKER_HUB_USERNAME}/frontend:${BUILD_ID}"
                    sh "docker push ${DOCKER_HUB_USERNAME}/frontend:latest"

                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    sh "kubectl apply -f k8s/"
                }
            }
        }
    }
}
