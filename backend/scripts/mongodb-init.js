// MongoDB Initialization Script
// Exécutez ceci dans MongoDB Compass ou mongosh après la création du cluster

// 1. Créer la base de données Tarcom
use tarcom;

// 2. Créer la collection "submissions" avec validation
db.createCollection("submissions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "phone", "status"],
      properties: {
        firstName: { 
          bsonType: "string",
          description: "Prénom"
        },
        lastName: { 
          bsonType: "string",
          description: "Nom"
        },
        email: { 
          bsonType: "string",
          description: "Email - doit être unique"
        },
        phone: { 
          bsonType: "string",
          description: "Numéro de téléphone"
        },
        ficheRenseignement: {
          bsonType: "object",
          description: "Fiche de renseignement complète",
          properties: {
            dateOfBirth: { bsonType: "date" },
            placeOfBirth: { bsonType: "string" },
            nationality: { bsonType: "string" },
            address: { bsonType: "string" },
            city: { bsonType: "string" },
            postalCode: { bsonType: "string" },
            emergencyName: { bsonType: "string" },
            emergencyPhone: { bsonType: "string" },
            emergencyRelation: { bsonType: "string" },
            socialSecurityNumber: { bsonType: "string" },
            healthMutual: { bsonType: "string" },
            healthMutualNumber: { bsonType: "string" },
            drivingLicenseNumber: { bsonType: "string" },
            licenseExpiryDate: { bsonType: "date" },
            vehicleType: { bsonType: "string" }
          }
        },
        documents: {
          bsonType: "object",
          description: "Fichiers documents (références GridFS)",
          properties: {
            identity: {
              bsonType: "object",
              properties: {
                fileId: { bsonType: "objectId" },
                fileName: { bsonType: "string" },
                fileSize: { bsonType: "long" },
                contentType: { bsonType: "string" },
                uploadedAt: { bsonType: "date" }
              }
            },
            photo: { bsonType: "object" },
            drivingLicense: { bsonType: "object" },
            bankDetails: { bsonType: "object" },
            healthInsurance: { bsonType: "object" },
            medicalCertificate: { bsonType: "object" }
          }
        },
        status: {
          enum: ["pending", "approved", "rejected"],
          description: "Statut de la soumission"
        },
        submittedAt: { 
          bsonType: "date",
          description: "Date de soumission"
        },
        reviewedAt: { 
          bsonType: "date",
          description: "Date de révision"
        },
        notes: { 
          bsonType: "string",
          description: "Notes de l'admin"
        },
        createdAt: { 
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: { 
          bsonType: "date",
          description: "Dernière mise à jour"
        }
      }
    }
  }
});

// 3. Créer les indexes pour optimiser les requêtes
db.submissions.createIndex({ email: 1 }, { unique: true });
db.submissions.createIndex({ status: 1 });
db.submissions.createIndex({ createdAt: -1 });
db.submissions.createIndex({ submittedAt: -1 });
db.submissions.createIndex({ "ficheRenseignement.socialSecurityNumber": 1 });

// 4. Créer la collection GridFS (automatique, mais on peut initialiser)
// Les collections fs.files et fs.chunks seront créées automatiquement par Spring Boot

// 5. Ajouter un index TTL pour supprimer les documents temporaires après 30 jours
// (optionnel - pour nettoyer les brouillons non soumis)
db.submissions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// 6. Afficher les statistiques
db.submissions.stats();

print("✓ Collections créées avec succès!");
print("✓ Indexes créés avec succès!");
print("✓ Votre base de données Tarcom est prête!");
