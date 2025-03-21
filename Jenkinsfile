pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = credentials('eks-kubeconfig')
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
                sh "mkdir -p k8s-processed"
                sh "cat k8s-manifests.yaml | sed 's/\\${DOCKER_USERNAME}/${DOCKER_USERNAME}/g; s/\\${IMAGE_TAG}/${IMAGE_TAG}/g' > k8s-processed/manifests.yaml"
                sh "kubectl --kubeconfig=${KUBECONFIG} apply -f k8s-processed/manifests.yaml"
                sh "kubectl --kubeconfig=${KUBECONFIG} rollout status deployment/frontend -n three-tier-app"
                sh "kubectl --kubeconfig=${KUBECONFIG} rollout status deployment/backend -n three-tier-app"
            }
        }
    }
    
    post {
        success {
            echo "Deployment successful! Your 3-tier application is now running on EKS."
            sh "kubectl --kubeconfig=${KUBECONFIG} get services frontend -n three-tier-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
        }
        failure {
            echo "Deployment failed. Check the logs for more information."
        }
        always {
            sh "docker logout"
        }
    }
}