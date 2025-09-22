# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -e -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

ENV JAVA_OPTS=""

# Spring Boot will read these from env; compose will inject values
ENV SPRING_DATASOURCE_URL="jdbc:mysql://mysql:3306/healthcare_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
ENV SPRING_DATASOURCE_USERNAME="root"
ENV SPRING_DATASOURCE_PASSWORD="root"
ENV SERVER_PORT=8082

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]


