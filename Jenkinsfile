pipeline {
  agent any

  environment {
    DOCKERHUB_USER = 'mekalasanjith'
    DOCKERHUB_PASS = credentials('dockerhub-password')
    DOCKER_NAMESPACE = 'mekalasanjith'
    BACKEND_IMAGE = "${DOCKER_NAMESPACE}/hsa-backend:latest"
    GATEWAY_IMAGE = "${DOCKER_NAMESPACE}/hsa-gateway:latest"
    FRONTEND_IMAGE = "${DOCKER_NAMESPACE}/hsa-frontend:latest"
  }

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Login to Docker Hub') {
      steps {
        bat 'echo %DOCKERHUB_PASS% | docker login -u "%DOCKERHUB_USER%" --password-stdin'
      }
    }

    stage('Build Images') {
      parallel {
        stage('Backend') {
          steps {
            bat 'docker build -t %BACKEND_IMAGE% backend'
          }
        }
        stage('API Gateway') {
          steps {
            bat 'docker build -t %GATEWAY_IMAGE% api-gateway'
          }
        }
        stage('Frontend') {
          steps {
            bat 'docker build -t %FRONTEND_IMAGE% .'
          }
        }
      }
    }

    stage('Push Images') {
      steps {
        bat 'docker push %BACKEND_IMAGE%'
        bat 'docker push %GATEWAY_IMAGE%'
        bat 'docker push %FRONTEND_IMAGE%'
      }
    }

    stage('Deploy (optional)') {
      when { expression { return env.DEPLOY_HOST && env.DEPLOY_USER } }
      steps {
        // Requires SSH key on the Jenkins agent and target host to be trusted
        bat "echo Skipping deploy stage on Windows agent unless SSH is configured"
      }
    }
  }

  post {
    always {
      bat 'docker logout || ver > nul'
    }
  }
}


