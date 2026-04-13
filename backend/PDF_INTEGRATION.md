# Guide d'Intégration PDF et Base de Données

## Vue d'ensemble

La structure pour la génération PDF et la sauvegarde en base de données est maintenant en place. Voici comment l'intégrer complètement.

## Architecture Actuelle

```
Frontend (SubmissionForm)
    ↓
Fiche de Renseignement (étape 2)
    ↓
Documents (étape 3)
    ↓
Endpoint: /api/submissions
    ↓
[À intégrer] MongoDB + GridFS
[À intégrer] Génération PDF
```

## Fichiers Créés pour la Génération PDF

### 1. `lib/pdf-generator.ts`
- Utilitaires pour formater les données
- Fonctions prêtes pour jsPDF, PDFKit, etc.
- Structure pour générer le fichier PDF

### 2. `app/api/generate-pdf/route.ts`
- Endpoint dédié à la génération PDF
- Reçoit les données de la Fiche
- Retourne le PDF généré

### 3. `components/FicheRenseignement.tsx`
- Formulaire web pour remplir la Fiche
- 5 sections logiques:
  - Identité
  - Contact
  - Personne à contacter en urgence
  - Sécurité sociale et mutuelle
  - Permis de conduire

## Intégration Step-by-Step

### Étape 1 : Installer les dépendances PDF

**Option A : jsPDF (léger, recommandé pour les PDFs simples)**
```bash
npm install jspdf
npm install -D @types/jspdf
```

**Option B : PDFKit (plus complet, pour serveur Node.js)**
```bash
npm install pdfkit
npm install -D @types/pdfkit
```

**Option C : Puppeteer (pour génération HTML→PDF)**
```bash
npm install puppeteer
```

### Étape 2 : Configurer la Génération PDF

**Avec jsPDF (Recommandé):**

Modifier `lib/pdf-generator.ts`:

```typescript
import jsPDF from 'jspdf';

export async function generateFichePDF(data: FicheRenseignementData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Titre
  doc.setFontSize(16);
  doc.text('FICHE DE RENSEIGNEMENT', 105, 20, { align: 'center' });
  
  // Contenu
  doc.setFontSize(10);
  let yPosition = 35;
  
  // Section Identité
  doc.setFontSize(12);
  doc.text('IDENTITÉ', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.text(`Prénom: ${data.firstName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Nom: ${data.lastName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Date de naissance: ${data.dateOfBirth}`, 20, yPosition);
  yPosition += 10;
  
  // ... répéter pour autres sections
  
  return Buffer.from(doc.output('arraybuffer'));
}
```

### Étape 3 : Implémenter l'Endpoint de Génération

Modifier `app/api/generate-pdf/route.ts`:

```typescript
import { generateFichePDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { ficheData } = await request.json();

    // Générer le PDF
    const pdfBuffer = await generateFichePDF(ficheData);
    
    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Fiche_${ficheData.lastName}_${ficheData.firstName}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
```

### Étape 4 : Intégrer MongoDB

**Installation:**
```bash
npm install mongodb
```

**Configuration dans `.env.local`:**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dossiers
MONGODB_DB_NAME=dossiers
```

**Créer `lib/mongodb.ts`:**

```typescript
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  
  cachedClient = client;
  return client;
}

export async function getDatabase() {
  const client = await connectToDatabase();
  return client.db(process.env.MONGODB_DB_NAME);
}
```

### Étape 5 : Sauvegarder les Données et le PDF

Modifier `app/api/submissions/route.ts`:

```typescript
import { getDatabase } from '@/lib/mongodb';
import { GridFSBucket } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Extraire les données
    const formData = await request.formData();
    const ficheData = JSON.parse(formData.get('ficheData') as string);
    
    // Générer le PDF
    const pdfBuffer = await generateFichePDF(ficheData);
    
    // Créer un bucket GridFS
    const bucket = new GridFSBucket(db);
    
    // Sauvegarder le PDF dans GridFS
    const pdfStream = bucket.openUploadStream(
      `fiche_${ficheData.lastName}_${ficheData.firstName}.pdf`
    );
    
    pdfStream.write(pdfBuffer);
    pdfStream.end();
    
    // Sauvegarder le dossier dans la collection
    const result = await db.collection('submissions').insertOne({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      ficheData,
      pdfFileId: pdfStream.id,
      documents: {}, // Les fichiers documents
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      submissionId: result.insertedId,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
```

## Structure MongoDB Recommandée

```javascript
// Collection: submissions
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  ficheData: {
    dateOfBirth: string,
    placeOfBirth: string,
    nationality: string,
    address: string,
    city: string,
    postalCode: string,
    emergencyName: string,
    emergencyPhone: string,
    emergencyRelation: string,
    socialSecurityNumber: string,
    healthMutual: string,
    healthMutualNumber: string,
    drivingLicense: string,
    licenseExpiryDate: string,
    vehicleType: string,
  },
  pdfFileId: ObjectId, // GridFS ID du PDF généré
  documents: {
    identity: ObjectId,     // GridFS IDs
    photo: ObjectId,
    drivingLicense: ObjectId,
    bankDetails: ObjectId,
    healthInsurance: ObjectId,
    medicalCertificate: ObjectId,
  },
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Date,
  updatedAt: Date,
  reviewNotes: string, // Pour les admins
}
```

## Télécharger le PDF Généré

Vous pouvez ajouter une route pour télécharger le PDF:

```typescript
// app/api/submissions/[id]/download-fiche/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase();
    const submission = await db.collection('submissions').findOne({
      _id: new ObjectId(params.id)
    });
    
    if (!submission || !submission.pdfFileId) {
      return NextResponse.json({ error: 'PDF non trouvé' }, { status: 404 });
    }
    
    const bucket = new GridFSBucket(db);
    const stream = bucket.openDownloadStream(submission.pdfFileId);
    
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
```

## Checklist d'Intégration

- [ ] Installer jsPDF (ou bibliothèque PDF choisie)
- [ ] Implémenter `generateFichePDF()` dans `lib/pdf-generator.ts`
- [ ] Mettre à jour `/api/generate-pdf/route.ts`
- [ ] Installer MongoDB et configurer `.env.local`
- [ ] Créer `lib/mongodb.ts`
- [ ] Mettre à jour `/api/submissions/route.ts` pour sauvegarder en BD
- [ ] Tester la génération PDF localement
- [ ] Tester la sauvegarde MongoDB
- [ ] Déployer sur production

## Ressources Utiles

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [GridFS Documentation](https://www.mongodb.com/docs/manual/core/gridfs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
