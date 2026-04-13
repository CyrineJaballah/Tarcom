# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY backend/spring-boot ./spring-boot
WORKDIR /app/spring-boot
RUN mvn clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/spring-boot/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "echo 'Runtime Port: $PORT' && echo 'Runtime Mongo: $MONGODB_URI' && java -jar app.jar"]
