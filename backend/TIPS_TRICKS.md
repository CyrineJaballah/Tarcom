# Tips & Astuces

Des conseils pour tirer le meilleur de cette application minimaliste.

## 🎨 Personnalisation du Design

### Changer la Couleur Primaire

**Étape 1** : Ouvrir `app/globals.css`

Trouver cette ligne :

```css
--primary: oklch(0.45 0.15 250);
```

Remplacer par votre couleur indigo :

```css
--primary: oklch(0.45 0.15 220); /* Bleu */
--primary: oklch(0.5 0.18 320); /* Rose */
--primary: oklch(0.55 0.15 120); /* Vert */
```

**Étape 2** : Dark mode
Faire la même chose dans `.dark {`

### Changer les Fonts

Dans `app/layout.tsx` :

```tsx
import { Poppins, Inter } from "next/font/google";

const font = Poppins({ weight: ["400", "600", "700"] });
```

Puis en CSS :

```css
@theme inline {
  --font-sans: "Poppins", sans-serif;
}
```

### Changer le Logo/Branding

Dans `app/page.tsx` :

```tsx
<div className="text-2xl font-bold text-primary">Votre Logo</div>
```

Ou ajouter une image :

```tsx
<img src="/logo.svg" alt="Logo" className="w-10 h-10" />
```

## 📱 Ajouter des Pages

### Nouvelle Page Simple

1. Créer `app/ma-page/page.tsx` :

```tsx
"use client";

export default function MaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Ma Page</h1>
      {/* Contenu */}
    </div>
  );
}
```

2. Ajouter le lien dans la navigation :

- Mettre à jour `lib/ui-config.ts`
- Ou ajouter hardcoded dans `app/page.tsx`

### Nouvelle Page avec API

1. Créer `app/api/ma-route/route.ts` :

```ts
export async function GET() {
  return Response.json({ data: [] });
}

export async function POST(req: Request) {
  const data = await req.json();
  return Response.json({ success: true });
}
```

2. Utiliser dans un composant :

```tsx
const response = await fetch("/api/ma-route");
const data = await response.json();
```

## 🎯 Ajouter des Documents

Modifier le formulaire pour ajouter un nouveau document :

**Étape 1** : Dans `lib/config.ts`, ajouter à `DOCUMENT_REQUIREMENTS` :

```ts
{
  id: 'monDoc',
  name: 'Mon Document',
  description: 'Description...',
  required: true,
  formats: ['PDF', 'JPG'],
}
```

**Étape 2** : Dans `components/SubmissionForm.tsx`, ajouter à `documentTypes` :

```ts
{ id: 'monDoc', name: 'Mon Document', desc: 'Description', required: true }
```

**Étape 3** : Ajouter au state initial :

```ts
const [documents, setDocuments] = useState({
  // ... autres
  monDoc: undefined,
});
```

## 💌 Configurer les Emails

### Gmail (SMTP)

1. Créer un compte Google App Password :
   - Aller à https://myaccount.google.com/security
   - Authentification 2FA activée
   - Générer "Mot de passe d'application"

2. Dans `.env.local` :

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=motdepasse-app
```

### SendGrid (Alternative)

1. S'inscrire sur https://sendgrid.com
2. Copier la clé API
3. Dans `.env.local` :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
```

### Mailgun (Alternative)

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.com
SMTP_PASSWORD=clé-api
```

## 🗄️ Base de Données

### MongoDB Atlas (Cloud)

1. Aller sur https://mongodb.com/atlas
2. Créer un cluster gratuit
3. Obtenir la connection string
4. Dans `.env.local` :

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dossiers
```

### MongoDB Local (Développement)

1. Installer MongoDB Community
2. Lancer : `mongod`
3. Dans `.env.local` :

```
MONGODB_URI=mongodb://localhost:27017/dossiers
```

## 🚀 Déployer

### Vercel (Recommended)

1. Pousser sur GitHub
2. Connecter sur vercel.com
3. Configurer variables d'environnement
4. Déployer (auto)

```bash
# Ou via CLI
npm i -g vercel
vercel --prod
```

### Docker

1. Créer `Dockerfile` :

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Lancer :

```bash
docker build -t dossiers .
docker run -p 3000:3000 dossiers
```

### Railway

1. Connecter GitHub
2. Créer nouveau projet
3. Ajouter variables
4. Déployer

## 🔐 Sécurité

### Protéger l'Admin

Ajouter une vérification simple :

```tsx
// app/admin/page.tsx
const password = prompt("Mot de passe admin?");
if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
  return <div>Accès refusé</div>;
}
```

Ou avec JWT :

```bash
npm install jsonwebtoken
```

### Variables Sensibles

✅ Dans `.env.local` seulement
✅ Jamais dans le code
✅ Jamais dans Git
✅ `.env.local` dans `.gitignore`

## 🧪 Debug

### Console Logs

```tsx
console.log("[DOSSIERS]", "Mon message");
```

En production, filtrer :

```tsx
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}
```

### Network Requests

F12 → Network → Voir les requêtes API

- Vérifier statuts 200, 400, 500
- Voir les réponses JSON
- Vérifier headers

### Dark Mode Test

- DevTools → F12
- Clic droit → Inspecter
- Ajouter classe `dark` à `<html>`

## 📊 Analytics (Optionnel)

Ajouter Google Analytics :

```tsx
// app/layout.tsx
import Script from "next/script";

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXX`}
  strategy="afterInteractive"
/>;
```

## 🎁 Bonus : Fonctionnalités Futures

### Historique de Dossiers

```tsx
// Stocker l'ID dans localStorage
localStorage.setItem("lastSubmissionId", submissionId);
```

### Notification Toast

```tsx
// Ajouter sonner ou react-hot-toast
import toast from "react-hot-toast";
toast.success("Succès !");
```

### Dark Mode Toggle

```tsx
// Ajouter un switch dans la nav
<button onClick={() => document.documentElement.classList.toggle("dark")}>
  🌙
</button>
```

### Validation Côté Serveur

```ts
// app/api/submissions/route.ts
import { z } from "zod";

const Schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // ...
});
```

## 💡 Bonnes Pratiques

### Nommage

✅ `getUserData()` - clair et descriptif
❌ `getData()` - trop vague

✅ `components/FormField.tsx` - spécifique
❌ `components/Field.tsx` - ambigu

### Spacing

✅ `gap-4` - clair, cohérent
❌ `gap-[14px]` - arbitraire, maintenance difficile

### Couleurs

✅ `text-primary` - sémantique
❌ `text-blue-500` - hardcodé, pas scalable

### Comments

```tsx
// ✅ Bon : Explique le WHY
// Valider par contre qu'au moins un document est uploads
if (documents.length === 0) throw new Error("...");

// ❌ Mauvais : Explique le WHAT (évidènt)
// Check if no documents
if (documents.length === 0) throw new Error("...");
```

## 🐛 Dépannage Courant

### "env variables not found"

→ Redémarrer : `npm run dev`
→ Vérifier `.env.local`

### "Style not applying"

→ Verifier syntaxe Tailwind
→ Verifier variable CSS en globals.css
→ Hard refresh (Ctrl+Maj+R)

### "API returns 500"

→ Vérifier les logs serveur
→ Vérifier variables d'environnement
→ Vérifier la connexion base de données

### "Upload ne fonctionne pas"

→ Vérifier taille fichier < 10 Mo
→ Vérifier le format
→ Vérifier les permissions

---

**Besoin d'aide ?**

- Consulter README.md
- Consulter GUIDE_DEMARRAGE.md
- Vérifier CONTRIBUTING.md

Bonne chance ! 🚀
