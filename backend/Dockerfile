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

RUN echo "--- BUILD-TIME ENV CHECK ---" && \
    echo "PORT: $PORT" && \
    echo "BASE_ROUTE: $BASE_ROUTE" && \
    echo "MONGODB_URI: $MONGODB_URI" && \
    echo "MONGODB_CREATION: $MONGODB_CREATION" && \
    echo "MAX_FILE_SIZE: $MAX_FILE_SIZE" && \
    echo "MAX_REQUEST_SIZE: $MAX_REQUEST_SIZE" && \
    echo "TIMESTAMPS: $TIMESTAMPS" && \
    echo "TIME_ZONE: $TIME_ZONE" && \
    echo "SPRING_LOGGING_LEVEL: $SPRING_LOGGING_LEVEL" && \
    echo "APP_LOGGING_LEVEL: $APP_LOGGING_LEVEL" && \
    echo "----------------------------"

COPY backend/spring-boot ./spring-boot
WORKDIR /app/spring-boot
RUN mvn clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/spring-boot/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

