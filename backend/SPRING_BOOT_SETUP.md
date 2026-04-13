# Spring Boot Setup Guide - Tarcom Backend

## Prérequis

- Java 17 ou supérieur
- Maven 3.8+
- MongoDB Atlas compte (gratuit)

---

## Étape 1 : Créer le projet Spring Boot

### Option A : Avec Spring Boot CLI

```bash
spring boot new tarcom-api --from-template java
cd tarcom-api
```

### Option B : Avec Maven

```bash
mvn archetype:generate \
  -DgroupId=com.tarcom \
  -DartifactId=dossiers \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
cd dossiers
```

### Option C : Avec Spring Initializr

Allez sur [start.spring.io](https://start.spring.io) et sélectionnez :
- **Project** : Maven Project
- **Language** : Java
- **Spring Boot** : 3.2.x (latest)
- **Group** : com.tarcom
- **Artifact** : dossiers
- **Dependencies** :
  - Spring Web
  - Spring Data MongoDB
  - Lombok

---

## Étape 2 : Configuration Maven (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.tarcom</groupId>
    <artifactId>dossiers</artifactId>
    <version>1.0.0</version>
    <name>Tarcom Dossiers API</name>
    <description>API pour la gestion des dossiers Tarcom</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- MongoDB -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>

        <!-- GridFS (pour les fichiers) -->
        <dependency>
            <groupId>org.springframework.data</groupId>
            <artifactId>spring-data-mongodb</artifactId>
        </dependency>

        <!-- Lombok (annotations) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JSON Processing -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>

        <!-- Commons IO (utilitaires fichiers) -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.11.0</version>
        </dependency>

        <!-- Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## Étape 3 : Configuration Spring Boot

### Fichier `application.properties`

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# MongoDB
spring.data.mongodb.uri=mongodb+srv://tarcom_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tarcom?retryWrites=true&w=majority
spring.data.mongodb.database=tarcom
spring.data.mongodb.auto-index-creation=true

# Logging
logging.level.root=INFO
logging.level.com.tarcom=DEBUG

# Multipart upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB

# Jackson
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=UTC
```

### Fichier `application.yml` (alternative)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  data:
    mongodb:
      uri: mongodb+srv://tarcom_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tarcom?retryWrites=true&w=majority
      database: tarcom
      auto-index-creation: true
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB
  
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

logging:
  level:
    root: INFO
    com.tarcom: DEBUG
```

---

## Étape 4 : Structure du projet

```
tarcom-api/
├── src/
│   ├── main/
│   │   ├── java/com/tarcom/dossiers/
│   │   │   ├── DossiersApplication.java          (Main)
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java               (Config CORS)
│   │   │   ├── controller/
│   │   │   │   └── SubmissionController.java
│   │   │   ├── model/
│   │   │   │   ├── Submission.java
│   │   │   │   ├── FicheRenseignement.java
│   │   │   │   └── DocumentInfo.java
│   │   │   ├── repository/
│   │   │   │   └── SubmissionRepository.java
│   │   │   ├── service/
│   │   │   │   ├── SubmissionService.java
│   │   │   │   └── FileStorageService.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/tarcom/dossiers/
│           └── DossiersApplicationTests.java
└── pom.xml
```

---

## Étape 5 : Classe principale

```java
package com.tarcom.dossiers;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DossiersApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(DossiersApplication.class, args);
    }
}
```

---

## Étape 6 : Configuration CORS

```java
package com.tarcom.dossiers.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:3001")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## Étape 7 : Lancer l'application

```bash
# Avec Maven
./mvnw spring-boot:run

# Ou créer un JAR
./mvnw clean package
java -jar target/dossiers-1.0.0.jar
```

Vous devriez voir :
```
Started DossiersApplication in X.XXX seconds
```

L'API est maintenant accessible à `http://localhost:8080/api`

---

## Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/submissions` | Créer une soumission |
| GET | `/api/submissions/:id` | Obtenir une soumission |
| GET | `/api/submissions/email/:email` | Trouver par email |
| GET | `/api/submissions` | Lister (avec ?status=pending) |
| PUT | `/api/submissions/:id/status` | Mettre à jour le statut |
| GET | `/api/submissions/stats` | Statistiques |
| DELETE | `/api/submissions/:id` | Supprimer |

---

## Dépannage

### Port 8080 déjà utilisé

```bash
# Trouver le processus
lsof -i :8080

# Changer le port dans application.properties
server.port=8081
```

### MongoDB connection refused

- Vérifiez votre URI MongoDB
- Vérifiez l'IP whitelist dans MongoDB Atlas
- Vérifiez votre connection internet

### CORS errors

Assurez-vous que `CorsConfig` est créé et que les origins sont correctes

---

## Prochaines étapes

1. Implémenter le service de génération PDF
2. Ajouter l'authentification JWT
3. Ajouter la validation des emails
4. Ajouter les logs et monitoring
5. Connecter le frontend Next.js
