# Backend Setup Summary - Tarcom

Vous avez maintenant une application complète avec frontend + backend + base de données ! Voici ce qui a été créé.

---

## Architecture

### Frontend (Next.js)
- ✅ Page d'accueil Tarcom minimaliste
- ✅ Formulaire soumission 4 étapes
- ✅ Auto-sync données (Étape 1 → Étape 2)
- ✅ Upload drag-and-drop des documents
- ✅ Dashboard admin

### Backend (Spring Boot)
- ✅ 6 fichiers de modèles (Submission, FicheRenseignement, DocumentInfo, etc.)
- ✅ MongoDB Repository avec requêtes optimisées
- ✅ Services métier (SubmissionService, FileStorageService)
- ✅ REST API Controller (POST, GET, PUT, DELETE)
- ✅ Support GridFS pour les fichiers

### Base de données (MongoDB Atlas)
- ✅ Cluster gratuit configuré
- ✅ Collection "submissions" avec validation
- ✅ GridFS pour stocker les fichiers binaires
- ✅ Indexes optimisés pour les requêtes

---

## Fichiers créés

### Documentation

| Fichier | Description |
|---------|-------------|
| `MONGODB_SETUP.md` | Guide setup MongoDB Atlas (5 min) |
| `DATABASE_SCHEMA.md` | Schéma complet MongoDB + exemples |
| `SPRING_BOOT_SETUP.md` | Guide setup Spring Boot backend |
| `BACKEND_INTEGRATION.md` | Guide intégration frontend ↔ backend |
| `BACKEND_SETUP_SUMMARY.md` | Ce fichier |

### Code Spring Boot

| Chemin | Description |
|--------|-------------|
| `spring-boot/...model/Submission.java` | Modèle principal |
| `spring-boot/...model/FicheRenseignement.java` | Fiche de renseignement |
| `spring-boot/...model/DocumentInfo.java` | Info des fichiers |
| `spring-boot/...repository/SubmissionRepository.java` | Requêtes MongoDB |
| `spring-boot/...service/SubmissionService.java` | Logique métier |
| `spring-boot/...service/FileStorageService.java` | Gestion GridFS |
| `spring-boot/...controller/SubmissionController.java` | API REST endpoints |

### Scripts

| Fichier | Description |
|---------|-------------|
| `scripts/mongodb-init.js` | Initialiser MongoDB |
| `lib/api-client.ts` | Client API frontend |

### Configuration

| Fichier | Description |
|---------|-------------|
| `.env.example` | Variables d'environnement |

---

## Checklist de démarrage

### 1. Créer MongoDB Atlas (5-10 min)

```bash
# Allez sur mongodb.com et suivez MONGODB_SETUP.md
```

**À faire :**
- [ ] Créer un compte
- [ ] Créer un cluster gratuit
- [ ] Créer un utilisateur DB (tarcom_user)
- [ ] Whitelist IP (0.0.0.0/0 pour dev)
- [ ] Copier la chaîne de connexion

### 2. Setup Spring Boot (10-15 min)

```bash
# Cloner ou créer le projet Spring Boot
git clone https://github.com/tarcom/dossiers-api.git
cd dossiers-api

# Configurer application.properties avec votre MongoDB URI
# Puis lancer
./mvnw spring-boot:run
```

**À vérifier :**
- [ ] Application démarre sans erreur
- [ ] Logs affichent "Started DossiersApplication"
- [ ] API accessible : http://localhost:8080/api

### 3. Initialiser MongoDB

```bash
# Ouvrir MongoDB Compass
# Se connecter avec votre URI
# Exécuter le contenu de scripts/mongodb-init.js
```

**À vérifier :**
- [ ] Collection "submissions" créée
- [ ] Indexes créés
- [ ] Message de succès affiché

### 4. Configurer le Frontend

```bash
# À la racine du projet Next.js
cp .env.example .env.local

# Éditer .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Lancer
npm run dev
```

**À vérifier :**
- [ ] Frontend démarre : http://localhost:3000
- [ ] Page d'accueil Tarcom affichée
- [ ] Pas d'erreurs console

### 5. Tester l'intégration

```bash
# 1. Aller sur http://localhost:3000
# 2. Cliquer "Commencer"
# 3. Remplir le formulaire (4 étapes)
# 4. Soumettre
# 5. Vérifier dans MongoDB Compass qu'un document a été créé
```

**À vérifier :**
- [ ] Formulaire accepte les données
- [ ] Fichiers peuvent être uploadés
- [ ] Soumission réussie (message de succès)
- [ ] Document créé dans MongoDB

---

## API Endpoints

### Créer une soumission

```http
POST /api/submissions
Content-Type: multipart/form-data

firstName=Jean
lastName=Dupont
email=jean@example.com
phone=+33612345678
ficheData={"dateOfBirth":"1990-03-15",...}
documents[identity]=@carte_identite.pdf
documents[photo]=@photo.jpg
documents[drivingLicense]=@permis.pdf
documents[bankDetails]=@rib.pdf
```

**Response:**
```json
{
  "success": true,
  "message": "Dossier soumis avec succès",
  "submissionId": "507f1f77bcf86cd799439011"
}
```

### Obtenir une soumission

```http
GET /api/submissions/507f1f77bcf86cd799439011
```

### Lister les soumissions

```http
GET /api/submissions?status=pending
```

### Mettre à jour le statut

```http
PUT /api/submissions/507f1f77bcf86cd799439011/status
Content-Type: application/json

{"status": "approved"}
```

### Statistiques

```http
GET /api/submissions/stats
```

**Response:**
```json
{
  "total": 42,
  "pending": 35,
  "approved": 5,
  "rejected": 2
}
```

---

## Fichiers de configuration à mettre à jour

### Spring Boot - `application.properties`

```properties
# MongoDB
spring.data.mongodb.uri=mongodb+srv://tarcom_user:PASSWORD@cluster0.xxxxx.mongodb.net/tarcom?retryWrites=true&w=majority

# Server
server.port=8080

# Multipart
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB
```

### Frontend - `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Troubleshooting

### Spring Boot ne démarre pas

```bash
# Vérifier Java version
java -version

# Nettoyer et relancer
./mvnw clean
./mvnw spring-boot:run
```

### MongoDB connection error

- Vérifiez que MongoDB Atlas cluster est créé
- Vérifiez que votre IP est whitelistée
- Vérifiez le username/password dans l'URI

### CORS errors

Les headers CORS sont configurés pour :
- `http://localhost:3000`
- `http://localhost:3001`

Pour ajouter plus d'origins, éditez :
```java
// src/main/java/com/tarcom/dossiers/config/CorsConfig.java
registry.addMapping("/api/**")
    .allowedOrigins("your-origin-here")
```

### Les fichiers n'upload pas

Vérifiez que :
1. Les fichiers font moins de 10MB
2. Spring Boot accepte multipart : `spring.servlet.multipart.enabled=true`
3. GridFS est configuré

---

## Prochaines étapes optionnelles

### 1. Authentification Admin
Ajouter JWT pour sécuriser le dashboard admin

### 2. Envoi d'emails
Envoyer confirmation à l'utilisateur et notification à l'admin

### 3. Génération PDF
Générer PDF automatiquement de la fiche + documents

### 4. Validation avancée
Vérifier les types MIME, scanner pour malware, etc.

### 5. Déploiement
- Frontend : Vercel
- Backend : Heroku, AWS, ou votre serveur
- MongoDB : Atlas (déjà en cloud)

---

## Fichiers de référence

Tous les guides détaillés :
- `MONGODB_SETUP.md` - MongoDB Atlas
- `SPRING_BOOT_SETUP.md` - Spring Boot
- `DATABASE_SCHEMA.md` - Schéma MongoDB
- `BACKEND_INTEGRATION.md` - Intégration complète
- `scripts/mongodb-init.js` - Script initialisation

---

## Support rapide

**Problème** | **Solution**
---------|----------
Port 8080 occupé | Changer `server.port` dans application.properties
Erreur MongoDB | Vérifier URI et whitelist IP
CORS error | Ajouter origin dans CorsConfig
Fichiers pas uploadés | Vérifier la taille < 10MB

---

Vous êtes prêt ! Commencez par `MONGODB_SETUP.md`, puis `SPRING_BOOT_SETUP.md`, puis testez ! 🚀
