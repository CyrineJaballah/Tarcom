# Mise à jour : Documents Requis et Fiche de Renseignement

## Résumé des Changements

L'application a été mise à jour pour intégrer les documents requis exacts et ajouter une **Fiche de Renseignement** comme formulaire web.

## Documents Requis (Mis à jour)

### Documents Obligatoires (4)
1. **Pièce d'identité recto et verso** - Carte d'identité ou passeport (clair et lisible)
2. **Photo d'identité conforme** - Format 4x4 cm, fond blanc, visage de face
3. **Permis de conduire recto et verso** - Permis valide (clair et lisible)
4. **RIB officiel** - Avec toutes les informations bancaires et nom/prénom

### Documents Optionnels (2)
5. **Justificatif mutuelle et numéro SS** - Document de la mutuelle + Sécurité sociale
6. **Certificat d'Aptitude médical** - Datant de moins de 2 ans, correspondant au métier/activité

## Nouvelle Architecture du Formulaire

Le formulaire de soumission comprend maintenant **4 étapes**:

### Étape 1 : Informations Personnelles
- Prénom
- Nom
- Email
- Téléphone

### Étape 2 : Fiche de Renseignement ✨ (NOUVEAU)
Formulaire web complet avec 5 sections:

#### 2.1 Identité
- Prénom (pré-rempli)
- Nom (pré-rempli)
- Date de naissance *
- Lieu de naissance *
- Nationalité *

#### 2.2 Contact
- Email (pré-rempli)
- Téléphone (pré-rempli)
- Adresse *
- Ville *
- Code postal *

#### 2.3 Personne à Contacter en Urgence
- Nom et prénom *
- Téléphone *
- Lien de parenté *

#### 2.4 Sécurité Sociale et Mutuelle
- Numéro de Sécurité sociale (optionnel)
- Mutuelle de santé (optionnel)
- Numéro de mutuelle (optionnel)

#### 2.5 Permis de Conduire
- Numéro de permis (optionnel)
- Date d'expiration (optionnel)
- Catégorie de permis (optionnel)

### Étape 3 : Documents
Téléchargement des 6 documents (4 obligatoires + 2 optionnels)

### Étape 4 : Vérification
- Résumé de tous les informations
- Confirmation avant envoi

## Fichiers Modifiés

### Components
- ✏️ `components/SubmissionForm.tsx` - Ajout étape Fiche + 4 étapes totales
- ✨ `components/FicheRenseignement.tsx` - NOUVEAU : Composant de la Fiche

### Configuration
- ✏️ `lib/config.ts` - Documents mis à jour
- ✨ `lib/pdf-generator.ts` - NOUVEAU : Utilitaires PDF
- ✨ `app/api/generate-pdf/route.ts` - NOUVEAU : Endpoint PDF

### Documentation
- ✨ `PDF_INTEGRATION.md` - NOUVEAU : Guide complet d'intégration PDF + DB

## Fonctionnalités Principales

### ✅ Formulaire Web pour la Fiche
- **Pas de PDF à télécharger** pour remplir la fiche
- Tous les champs remplissables directement dans le navigateur
- Pré-remplissage automatique des champs (nom, email, téléphone)
- Validation en temps réel

### ✅ Génération PDF Automatique (prête pour intégration)
- Structure prête avec `lib/pdf-generator.ts`
- Endpoint `/api/generate-pdf` pour générer le PDF
- Compatible avec jsPDF, PDFKit, Puppeteer
- Sauvegarde en MongoDB + GridFS (structure prête)

### ✅ Sauvegarde des Données
- Fiche de Renseignement sérialisée en JSON
- Documents uploaded séparément
- Structure MongoDB prête dans `PDF_INTEGRATION.md`

## Flux de Soumission

```
1. Informations Personnelles
   ↓
2. Fiche de Renseignement (formulaire web)
   ↓
3. Téléchargement des Documents
   ↓
4. Vérification
   ↓
5. Envoi → Backend
```

## Prochaines Étapes

### Pour implémenter la génération PDF:
1. Lire `PDF_INTEGRATION.md` (guide complet)
2. Installer jsPDF: `npm install jspdf`
3. Implémenter `generateFichePDF()` dans `lib/pdf-generator.ts`
4. Mettre à jour `/api/generate-pdf/route.ts`

### Pour connecter la base de données:
1. Installer MongoDB: `npm install mongodb`
2. Créer `.env.local` avec `MONGODB_URI`
3. Implémenter `lib/mongodb.ts`
4. Mettre à jour `/api/submissions/route.ts`

## Validation des Champs Obligatoires

Les champs suivants sont obligatoires avant soumission:

### Infos Personnelles
- ✅ Prénom
- ✅ Nom
- ✅ Email
- ✅ Téléphone

### Fiche de Renseignement
- ✅ Date de naissance
- ✅ Lieu de naissance
- ✅ Nationalité
- ✅ Adresse
- ✅ Ville
- ✅ Code postal
- ✅ Contact urgence (nom, téléphone, lien)

### Documents
- ✅ Pièce d'identité
- ✅ Photo d'identité
- ✅ Permis de conduire
- ✅ RIB

## Utilisation

### Pour les Utilisateurs
1. Accédez à `/submit`
2. Remplissez les 4 étapes
3. Cliquez "Soumettre"
4. Confirmez le succès ✅

### Pour les Administrateurs
1. Accédez à `/admin`
2. Visualisez les dossiers
3. Filtrez par statut
4. Téléchargez les documents et la fiche

## Support

Pour toute question sur l'intégration:
- Lire `PDF_INTEGRATION.md`
- Consulter les commentaires dans le code
- Vérifier `lib/pdf-generator.ts` pour les structures de données
