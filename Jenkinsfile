pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
        DOCKER_IMAGE_SERVER = "sandy3722/ecommerce-server"
        DOCKER_IMAGE_CLIENT = "sandy3722/ecommerce-client"
        KUBECONFIG = credentials('kubeconfig-credentials-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
                dir('client') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    dockerImageServer = docker.build("${DOCKER_IMAGE_SERVER}:${env.BUILD_NUMBER}", "./server")
                    dockerImageClient = docker.build("${DOCKER_IMAGE_CLIENT}:${env.BUILD_NUMBER}", "./client")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials-id') {
                        dockerImageServer.push()
                        dockerImageServer.push('latest')
                        dockerImageClient.push()
                        dockerImageClient.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh "sed -i 's|your-dockerhub-username/ecommerce-server:latest|${DOCKER_IMAGE_SERVER}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml"
                    sh "sed -i 's|your-dockerhub-username/ecommerce-client:latest|${DOCKER_IMAGE_CLIENT}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml"
                    
                    // Apply manifests using kubectl
                    // Assuming kubectl is configured on the Jenkins agent
                    sh 'kubectl apply -f k8s/deployment.yaml'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
