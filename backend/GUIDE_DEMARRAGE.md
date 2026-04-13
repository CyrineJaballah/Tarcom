# Guide de Démarrage Rapide

Tout ce dont vous avez besoin pour démarrer en 5 minutes.

## Installation

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000`

## Configuration Minimale

Créez un fichier `.env.local` :

```bash
# Base de données (optionnel pour le développement)
MONGODB_URI=mongodb://localhost:27017/dossiers

# Email (optionnel pour le développement)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=mot-de-passe-app
EMAIL_FROM=noreply@dossiers.fr
COMPANY_EMAIL=admin@dossiers.fr
```

## Pages Principales

| URL | Description |
|-----|-------------|
| `/` | Page d'accueil |
| `/submit` | Formulaire de soumission |
| `/admin` | Tableau de bord admin |

## Structure des Documents

Chaque dossier contient 5 documents :

1. **Pièce d'identité** - Recto-verso (PDF, JPG, PNG)
2. **Permis de conduire** - Recto-verso (PDF, JPG, PNG)
3. **Photo d'identité** - Format 4x4 (JPG, PNG)
4. **RIB bancaire** - Document officiel (PDF, JPG, PNG)
5. **Formulaire** - Rempli et signé (PDF, JPG, PNG, DOCX)

## Composants Clés

### SubmissionForm
Formulaire principal avec :
- Navigation par étapes
- Validation en temps réel
- Feedback utilisateur clair

### DocumentUploader
Glissez-déposez avec :
- Validation de fichier
- Aperçu du statut
- Gestion simple

### AdminDashboard
Tableau de bord avec :
- Statistiques
- Filtrage et recherche
- Actions rapides

## Développement

### Ajouter une nouvelle page

```tsx
// app/ma-page/page.tsx
export default function MaPage() {
  return <div className="container mx-auto px-4">...</div>
}
```

### Modifier les couleurs

Éditez `app/globals.css` pour les variables CSS :

```css
:root {
  --primary: oklch(0.45 0.15 250);
  --background: oklch(0.98 0 0);
  /* ... */
}
```

### Ajouter un nouveau document

Dans `lib/config.ts`, ajoutez à `DOCUMENT_REQUIREMENTS` :

```ts
{
  id: 'monDoc',
  name: 'Mon Document',
  description: 'Description courte',
  required: true,
  formats: ['PDF', 'JPG'],
}
```

## API

### POST /api/submissions

Envoie un dossier :

```bash
curl -X POST http://localhost:3000/api/submissions \
  -F "firstName=Jean" \
  -F "lastName=Dupont" \
  -F "email=jean@example.com" \
  -F "phone=+33612345678" \
  -F "documents[identity]=@id.pdf"
```

Réponse :

```json
{
  "id": "submission-123",
  "status": "success",
  "message": "Dossier reçu avec succès"
}
```

### GET /api/submissions

Récupère tous les dossiers (admin) :

```bash
curl http://localhost:3000/api/submissions
```

## Dépannage

### Le formulaire ne s'envoie pas

1. Vérifiez les variables d'environnement
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les logs du serveur

### Les emails ne sont pas envoyés

1. Configurez SMTP_HOST et SMTP_PORT
2. Vérifiez les identifiants SMTP
3. Activez "Accès aux applications moins sécurisées" (Gmail)

### Les fichiers ne se téléchargent pas

1. Vérifiez la limite de taille (10 Mo)
2. Vérifiez les formats autorisés
3. Vérifiez la connexion MongoDB

## Prochaines Étapes

1. Connecter une vraie base de données MongoDB
2. Configurer le service email (Gmail, SendGrid, etc.)
3. Ajouter l'authentification admin
4. Déployer sur Vercel

Consultez `INTEGRATION_GUIDE.md` pour les intégrations complètes.
