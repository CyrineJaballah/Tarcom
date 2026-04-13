# Backend Integration Guide - Tarcom

Ce guide vous montre comment connecter votre frontend Next.js à votre backend Spring Boot avec MongoDB.

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│              http://localhost:3000                          │
│                                                             │
│  - Page d'accueil (Tarcom)                                │
│  - Formulaire soumission (4 étapes)                        │
│  - Dashboard admin                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls (JSON)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Spring Boot)                          │
│              http://localhost:8080/api                      │
│                                                             │
│  - Controllers (REST API)                                  │
│  - Services (Business Logic)                               │
│  - MongoDB Repositories                                    │
│  - GridFS (File Storage)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ BSON/GridFS
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud)                          │
│     mongodb+srv://tarcom_user@cluster0.xxxxx                │
│                                                             │
│  - Collections: submissions                                │
│  - GridFS: fs.files + fs.chunks                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux de soumission complet

### 1. Utilisateur remplit le formulaire

```
Étape 1: Infos perso (firstName, lastName, email, phone)
    ↓ (auto-sync)
Étape 2: Fiche de Renseignement (remplie automatiquement + données additionnelles)
    ↓
Étape 3: Upload documents (6 fichiers)
    ↓
Étape 4: Vérification
    ↓
Soumettre
```

### 2. Frontend envoie les données

Le frontend crée un `FormData` avec :
- Données personnelles
- Données Fiche (JSON string)
- 6 fichiers binaires

```typescript
const formData = new FormData();
formData.append('firstName', 'Jean');
formData.append('lastName', 'Dupont');
formData.append('email', 'jean@example.com');
formData.append('phone', '+33612345678');
formData.append('ficheData', JSON.stringify(ficheData));
formData.append('documents[identity]', identityFile);
formData.append('documents[photo]', photoFile);
// ... etc
```

### 3. Backend reçoit et traite

```java
@PostMapping
public ResponseEntity<?> createSubmission(MultipartHttpServletRequest request) {
    // 1. Extraire les données du formulaire
    // 2. Valider les données
    // 3. Stocker les fichiers dans GridFS
    // 4. Sauvegarder les métadonnées dans MongoDB
    // 5. Retourner la confirmation
}
```

### 4. MongoDB stocke les données

```
submissions collection:
{
  _id: ObjectId,
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  ficheRenseignement: { ... },
  documents: {
    identity: { fileId: ObjectId("..."), ... },
    photo: { fileId: ObjectId("..."), ... },
    ...
  },
  status: "pending",
  createdAt: ISODate("2024-03-25T10:00:00Z")
}

fs.files collection (GridFS):
{
  _id: ObjectId("..."),
  filename: "carte_identite.pdf",
  length: 2048576,
  metadata: {
    documentType: "identity",
    submissionId: "507f1f77bcf86cd799439011"
  }
}
```

---

## Setup complet en 5 étapes

### Étape 1 : MongoDB Atlas

Suivez `MONGODB_SETUP.md` pour créer votre cluster MongoDB Atlas gratuit.

### Étape 2 : Spring Boot Backend

Suivez `SPRING_BOOT_SETUP.md` pour configurer et lancer votre backend.

**Commandes essentielles :**
```bash
cd spring-boot
./mvnw clean install
./mvnw spring-boot:run
```

Vérifiez : `http://localhost:8080/api/submissions` (devrait retourner `[]`)

### Étape 3 : Initialiser MongoDB

Exécutez le script d'initialisation dans MongoDB Compass :

```bash
# Dans MongoDB Compass ou mongosh
mongosh "mongodb+srv://tarcom_user:PASSWORD@cluster0.xxxxx.mongodb.net/tarcom"
```

Collez le contenu de `scripts/mongodb-init.js`

### Étape 4 : Configurer le Frontend

Créez un `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Lancez le frontend :

```bash
npm run dev
```

### Étape 5 : Tester l'intégration

1. Allez sur `http://localhost:3000`
2. Cliquez "Commencer"
3. Remplissez le formulaire
4. Soumettez
5. Vérifiez dans MongoDB Compass que le dossier a été créé

---

## Endpoints API disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| **POST** | `/submissions` | Créer + soumettre un dossier |
| **GET** | `/submissions/:id` | Obtenir un dossier par ID |
| **GET** | `/submissions/email/:email` | Trouver par email |
| **GET** | `/submissions?status=pending` | Lister par statut |
| **PUT** | `/submissions/:id/status` | Mettre à jour le statut |
| **DELETE** | `/submissions/:id` | Supprimer un dossier |
| **GET** | `/submissions/stats` | Statistiques |
| **GET** | `/files/:id` | Télécharger un fichier |

---

## Exemple d'appel API complet

### Frontend (Next.js)

```typescript
import { submitDossier } from '@/lib/api-client';

async function handleSubmit(formData, ficheData, documents) {
  const form = new FormData();
  
  // Ajouter les données
  form.append('firstName', formData.firstName);
  form.append('lastName', formData.lastName);
  form.append('email', formData.email);
  form.append('phone', formData.phone);
  form.append('ficheData', JSON.stringify(ficheData));
  
  // Ajouter les fichiers
  Object.entries(documents).forEach(([key, file]) => {
    if (file) form.append(`documents[${key}]`, file);
  });
  
  try {
    const response = await submitDossier(form);
    console.log('Soumission réussie:', response);
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### Backend (Spring Boot)

```java
@PostMapping
public ResponseEntity<?> createSubmission(MultipartHttpServletRequest request) {
    // Les fichiers sont automatiquement traités
    // Les données sont stockées dans MongoDB
    // Les fichiers sont stockés dans GridFS
    
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of(
            "success", true,
            "message", "Dossier soumis avec succès",
            "submissionId", created.getId()
        ));
}
```

### MongoDB (Données stockées)

```javascript
db.submissions.findOne({ email: "jean@example.com" })

{
  _id: ObjectId("..."),
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  phone: "+33612345678",
  ficheRenseignement: { ... },
  documents: {
    identity: { fileId: ObjectId("..."), fileName: "carte_identite.pdf", ... },
    ...
  },
  status: "pending",
  submittedAt: ISODate("2024-03-25T10:35:00Z"),
  createdAt: ISODate("2024-03-25T10:00:00Z"),
  updatedAt: ISODate("2024-03-25T10:35:00Z")
}
```

---

## Dépannage courant

### Erreur : "Failed to connect to localhost:8080"

**Solution :** Assurez-vous que Spring Boot est en cours d'exécution
```bash
./mvnw spring-boot:run
```

### Erreur : "CORS error"

**Solution :** Vérifiez que `CorsConfig` est configuré et que les origins sont correctes

```java
registry.addMapping("/api/**")
    .allowedOrigins("http://localhost:3000")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

### Erreur : "MongoDB connection refused"

**Solution :** 
1. Vérifiez votre URI MongoDB
2. Vérifiez que votre IP est whitelistée dans MongoDB Atlas
3. Vérifiez votre connection internet

### Erreur : "File size exceeds limit"

**Solution :** Les fichiers sont limités à 10MB. Vérifiez :
```properties
spring.servlet.multipart.max-file-size=10MB
```

### Les fichiers ne sont pas stockés

**Solution :** Vérifiez que GridFS est activé dans votre configuration

```java
@Configuration
public class MongoConfig {
    @Bean
    public GridFsTemplate gridFsTemplate(MongoOperations mongoOperations) {
        return new GridFsTemplate(mongoOperations);
    }
}
```

---

## Prochaines étapes avancées

### 1. Génération PDF automatique

Une fois la soumission reçue, générer un PDF de la fiche :

```bash
# À mettre en place avec iText ou PDFKit
```

### 2. Envoi d'emails

Envoyer une confirmation à l'utilisateur et une notification à l'admin :

```java
@Service
public class EmailService {
    public void sendConfirmation(String email, String dossierID) { ... }
    public void sendAdminNotification(String dossier) { ... }
}
```

### 3. Authentification JWT

Protéger les endpoints avec JWT :

```java
@Configuration
public class SecurityConfig {
    // JWT validation
}
```

### 4. Logging et monitoring

Ajouter ELK Stack ou autre solution de monitoring :

```properties
logging.level.com.tarcom=DEBUG
```

---

## Support et documentation

- **MongoDB** : https://docs.mongodb.com/
- **Spring Boot** : https://spring.io/projects/spring-boot
- **Spring Data MongoDB** : https://spring.io/projects/spring-data-mongodb
- **GridFS** : https://docs.mongodb.com/manual/core/gridfs/
