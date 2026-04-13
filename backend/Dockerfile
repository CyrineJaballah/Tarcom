# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only backend first (faster builds)
COPY backend/spring-boot ./spring-boot
COPY backend/.env ./spring-boot/.env

WORKDIR /app/spring-boot
RUN mvn clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

COPY --from=build /app/spring-boot/target/*.jar app.jar

COPY --from=build /app/spring-boot/.env .env

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
