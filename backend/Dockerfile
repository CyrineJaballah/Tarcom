# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

ARG PORT
ARG BASE_ROUTE
ARG MONGODB_URI
ARG MONGODB_CREATION
ARG MAX_FILE_SIZE
ARG MAX_REQUEST_SIZE
ARG TIMESTAMPS
ARG TIME_ZONE
ARG SPRING_LOGGING_LEVEL
ARG APP_LOGGING_LEVEL

COPY backend/spring-boot ./spring-boot
WORKDIR /app/spring-boot
RUN mvn clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/spring-boot/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

