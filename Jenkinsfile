pipeline {
  agent any

  environment {
    DOCKERHUB_USER = credentials('dockerhub-username')
    DOCKERHUB_PASS = credentials('dockerhub-password')
    DOCKER_NAMESPACE = 'mekalasanjith'
    BACKEND_IMAGE = "${DOCKER_NAMESPACE}/hsa-backend:latest"
    GATEWAY_IMAGE = "${DOCKER_NAMESPACE}/hsa-gateway:latest"
    FRONTEND_IMAGE = "${DOCKER_NAMESPACE}/hsa-frontend:latest"
  }

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Login to Docker Hub') {
      steps {
        sh 'echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin'
      }
    }

    stage('Build Images') {
      parallel {
        stage('Backend') {
          steps {
            sh 'docker build -t ${BACKEND_IMAGE} backend'
          }
        }
        stage('API Gateway') {
          steps {
            sh 'docker build -t ${GATEWAY_IMAGE} api-gateway'
          }
        }
        stage('Frontend') {
          steps {
            sh 'docker build -t ${FRONTEND_IMAGE} .'
          }
        }
      }
    }

    stage('Push Images') {
      steps {
        sh 'docker push ${BACKEND_IMAGE}'
        sh 'docker push ${GATEWAY_IMAGE}'
        sh 'docker push ${FRONTEND_IMAGE}'
      }
    }

    stage('Deploy (optional)') {
      when { expression { return env.DEPLOY_HOST && env.DEPLOY_USER } }
      steps {
        // Requires SSH key on the Jenkins agent and target host to be trusted
        sh '''
          set -e
          ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
          "mkdir -p ~/hsa && cd ~/hsa && cat > docker-compose.yml << 'YAML'\nservices:\n  mysql:\n    image: mysql:8.0\n    environment:\n      MYSQL_ROOT_PASSWORD: root\n      MYSQL_DATABASE: healthcare_db\n    volumes: [ db_data:/var/lib/mysql ]\n    healthcheck:\n      test: [\"CMD\",\"mysqladmin\",\"ping\",\"-h\",\"localhost\",\"-uroot\",\"-proot\"]\n      interval: 10s\n      timeout: 5s\n      retries: 10\n  backend:\n    image: ${BACKEND_IMAGE}\n    environment:\n      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/healthcare_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC\n      SPRING_DATASOURCE_USERNAME: root\n      SPRING_DATASOURCE_PASSWORD: root\n    depends_on:\n      mysql:\n        condition: service_healthy\n  api-gateway:\n    image: ${GATEWAY_IMAGE}\n    environment:\n      API_SERVICE_URL: http://backend:8082\n      PORT: 8000\n    ports: [ \"8000:8000\" ]\n    depends_on: [ backend ]\n  frontend:\n    image: ${FRONTEND_IMAGE}\n    ports: [ \"80:80\" ]\n    depends_on: [ api-gateway ]\nvolumes: { db_data: {} }\nYAML\n          docker compose pull && docker compose up -d"
        '''
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}


