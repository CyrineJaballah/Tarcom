# MongoDB Schema - Tarcom Dossiers

## Vue d'ensemble

La base de données Tarcom utilise MongoDB avec les collections suivantes pour stocker les dossiers, fiches et documents.

---

## Collection : `submissions`

Stocke les dossiers soumis avec toutes les informations principales.

```javascript
{
  _id: ObjectId,
  // Informations personnelles
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  
  // Fiche de renseignement
  ficheRenseignement: {
    dateOfBirth: Date,
    placeOfBirth: String,
    nationality: String,
    address: String,
    city: String,
    postalCode: String,
    emergencyName: String,
    emergencyPhone: String,
    emergencyRelation: String,
    socialSecurityNumber: String,
    healthMutual: String,
    healthMutualNumber: String,
    drivingLicenseNumber: String,
    licenseExpiryDate: Date,
    vehicleType: String
  },
  
  // Documents (références GridFS)
  documents: {
    identity: {
      fileId: ObjectId,     // Référence GridFS
      fileName: String,
      fileSize: Number,
      uploadedAt: Date
    },
    photo: { fileId, fileName, fileSize, uploadedAt },
    drivingLicense: { fileId, fileName, fileSize, uploadedAt },
    bankDetails: { fileId, fileName, fileSize, uploadedAt },
    healthInsurance: { fileId, fileName, fileSize, uploadedAt },  // optionnel
    medicalCertificate: { fileId, fileName, fileSize, uploadedAt } // optionnel
  },
  
  // Métadonnées
  status: String,           // "pending", "approved", "rejected"
  submittedAt: Date,
  reviewedAt: Date,         // optionnel
  notes: String,            // notes de l'admin
  createdAt: Date,
  updatedAt: Date
}
```

**Index recommandés :**
```javascript
db.submissions.createIndex({ email: 1 })
db.submissions.createIndex({ status: 1 })
db.submissions.createIndex({ createdAt: -1 })
db.submissions.createIndex({ submittedAt: -1 })
```

---

## GridFS : Stockage des fichiers

MongoDB GridFS stocke les fichiers volumineux en 2 collections :

### `fs.files` - Métadonnées

```javascript
{
  _id: ObjectId,
  length: Number,           // Taille en bytes
  chunkSize: Number,        // 255KB par défaut
  uploadDate: Date,
  filename: String,
  contentType: String,      // Ex: "application/pdf"
  metadata: {
    submissionId: ObjectId,
    documentType: String,   // "identity", "photo", etc.
    originalName: String
  }
}
```

### `fs.chunks` - Données des fichiers

```javascript
{
  _id: ObjectId,
  files_id: ObjectId,       // Référence à fs.files
  n: Number,                // Numéro du chunk
  data: BinData             // Données binaires du fichier
}
```

---

## Exemple de document complet

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  
  // Étape 1 : Infos perso
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33612345678",
  
  // Étape 2 : Fiche
  "ficheRenseignement": {
    "dateOfBirth": ISODate("1990-03-15"),
    "placeOfBirth": "Paris",
    "nationality": "Française",
    "address": "123 Rue de la Paix",
    "city": "Lyon",
    "postalCode": "69000",
    "emergencyName": "Marie Dupont",
    "emergencyPhone": "+33687654321",
    "emergencyRelation": "Mère",
    "socialSecurityNumber": "1900315123456789",
    "healthMutual": "Mutuelle XYZ",
    "healthMutualNumber": "ABC123456",
    "drivingLicenseNumber": "123456789ABC",
    "licenseExpiryDate": ISODate("2028-06-30"),
    "vehicleType": "Auto-école"
  },
  
  // Étape 3 : Documents
  "documents": {
    "identity": {
      "fileId": ObjectId("507f1f77bcf86cd799439012"),
      "fileName": "carte_identite.pdf",
      "fileSize": 2048576,
      "uploadedAt": ISODate("2024-03-25T10:30:00Z")
    },
    "photo": {
      "fileId": ObjectId("507f1f77bcf86cd799439013"),
      "fileName": "photo_identite.jpg",
      "fileSize": 512000,
      "uploadedAt": ISODate("2024-03-25T10:31:00Z")
    },
    "drivingLicense": {
      "fileId": ObjectId("507f1f77bcf86cd799439014"),
      "fileName": "permis_conduire.pdf",
      "fileSize": 3145728,
      "uploadedAt": ISODate("2024-03-25T10:32:00Z")
    },
    "bankDetails": {
      "fileId": ObjectId("507f1f77bcf86cd799439015"),
      "fileName": "rib.pdf",
      "fileSize": 1048576,
      "uploadedAt": ISODate("2024-03-25T10:33:00Z")
    }
  },
  
  // Métadonnées
  "status": "pending",
  "submittedAt": ISODate("2024-03-25T10:35:00Z"),
  "createdAt": ISODate("2024-03-25T10:00:00Z"),
  "updatedAt": ISODate("2024-03-25T10:35:00Z")
}
```

---

## Commandes MongoDB utiles

### Créer les collections et indexes

```javascript
// Créer la collection avec validation
db.createCollection("submissions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "phone", "status"],
      properties: {
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        status: { enum: ["pending", "approved", "rejected"] }
      }
    }
  }
})

// Créer les indexes
db.submissions.createIndex({ email: 1 }, { unique: true })
db.submissions.createIndex({ status: 1 })
db.submissions.createIndex({ createdAt: -1 })
```

### Requêtes utiles

```javascript
// Trouver tous les dossiers en attente
db.submissions.find({ status: "pending" })

// Trouver les dossiers d'un utilisateur
db.submissions.findOne({ email: "jean.dupont@example.com" })

// Compter les dossiers par statut
db.submissions.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Lister les dossiers triés par date
db.submissions.find().sort({ createdAt: -1 }).limit(10)
```

---

## Stockage des fichiers avec GridFS

### Avec Spring Boot

```java
@Service
public class FileStorageService {
    
    @Autowired
    private GridFsTemplate gridFsTemplate;
    
    public ObjectId storeFile(MultipartFile file, String documentType, String submissionId) {
        DBObject metadata = new BasicDBObject();
        metadata.put("documentType", documentType);
        metadata.put("submissionId", submissionId);
        
        return gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType(),
            metadata
        );
    }
    
    public GridFsResource retrieveFile(ObjectId fileId) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
        return gridFsTemplate.getResource(file);
    }
}
```

---

## Taille maximale des fichiers

- MongoDB : 16MB par document (mais 10MB avec GridFS par défaut)
- Recommandé : limiter à **10MB par fichier**
- Validation côté frontend et backend

---

## Sécurité

- Utiliser **encryption at rest** (MongoDB Atlas premium)
- Ajouter **authentication** sur tous les endpoints
- Valider les types MIME côté serveur
- Scanner les fichiers pour malware (optionnel)

---

## Prochaines étapes

1. Mettre à jour `application.properties` avec votre URI MongoDB
2. Créer les modèles JPA (voir `SPRING_BOOT_SETUP.md`)
3. Implémenter le service de stockage GridFS
4. Créer les endpoints REST
