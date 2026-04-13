# Guide de Contribution

Merci de vouloir contribuer ! Voici quelques lignes directrices simples.

## Principes de Design

Notre interface suit un design **minimaliste et épuré** :

### Maximes
- ✨ Moins d'éléments = meilleur design
- 📱 Mobile-first toujours
- ♿ Accessible par défaut
- 🎯 Un objectif par page/section
- 🇫🇷 Tout en français

### Palette de Couleurs
```
Primaire:  Indigo oklch(0.45 0.15 250)
Fond:      Blanc oklch(0.98 0 0)
Texte:     Noir oklch(0.2 0 0)
Bordure:   Gris clair oklch(0.94 0 0)
Succès:    Vert oklch(0.6 0.15 150)
Erreur:    Rouge oklch(0.577 0.245 27.325)
```

### Espacement
Utilisez le spacing Tailwind standard :
- `p-2` (0.5rem)
- `p-4` (1rem)
- `p-6` (1.5rem)
- `gap-4` (1rem)

Ne pas utiliser d'espacement arbitraire `p-[17px]`.

## Composition des Fichiers

### Pages (`app/*/page.tsx`)
```tsx
'use client'; // Si besoin d'interactivité

import { Component } from '@/components/ComponentName';

export default function PageName() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Contenu */}
    </div>
  );
}
```

### Composants
```tsx
'use client';

import { ReactNode } from 'react';

interface ComponentProps {
  children?: ReactNode;
  className?: string;
  // ...
}

export default function ComponentName({ children, ...props }: ComponentProps) {
  return <div>{children}</div>;
}
```

### Styles
- Utilisez Tailwind CSS uniquement
- Variables CSS pour les thèmes (`--primary`, `--foreground`, etc.)
- Classes sémantiques (`text-foreground`, `bg-background`)
- Pas de fichiers CSS séparés

## Checklist de Contribution

Avant de soumettre une PR :

### Code
- [ ] Fonctionnalité testée localement
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings ESLint
- [ ] Noms explicites en français

### Design
- [ ] Minimaliste et épuré
- [ ] Mobile-first responsive
- [ ] Contraste suffisant
- [ ] Cohérent avec le style existant

### Accessibilité
- [ ] Labels correctement associés aux inputs
- [ ] Attributs `aria-*` si nécessaire
- [ ] Navigation au clavier
- [ ] Focus visible

### Documentation
- [ ] README/GUIDE mis à jour si besoin
- [ ] Commentaires utiles dans le code
- [ ] Types TypeScript documentés

### Français
- [ ] Tous les textes en français
- [ ] Pas d'anglicismes
- [ ] Messages clairs et directs
- [ ] Vocabulaire simple

## Ajouter une Fonctionnalité

### 1. Nouvelle Page
```
app/
├── ma-page/
│   └── page.tsx
└── api/
    └── ma-endpoint/
        └── route.ts
```

### 2. Nouveau Composant
```
components/
├── MonComposant.tsx
├── MonComposant.test.tsx (optionnel)
└── index.ts (optionnel)
```

### 3. Nouvelle Configuration
Ajouter à `lib/ui-config.ts` ou `lib/config.ts`

### 4. Emails
Ajouter un template à `lib/emailTemplates.ts`

## Modification de Config/Styles

### Ajouter une Couleur
Modifiez `app/globals.css` :
```css
:root {
  --ma-couleur: oklch(...);
}
```

### Ajouter un Spacing
Utilisez les valeurs Tailwind existantes.

### Ajouter un Message
Modifiez `lib/ui-config.ts` :
```ts
MESSAGES: {
  MY_MESSAGE: 'Mon message...'
}
```

## Commit & PR

### Messages de Commit
```
feat: Ajouter la fonctionnalité X
fix: Corriger le bug de Y
style: Améliorer le design de Z
docs: Documenter X
```

### Description PR
```markdown
## Description
Une courte description de ce qui change.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Tests locaux
- [ ] Code review
- [ ] Documentation
```

## Questions ?

- Consultez `GUIDE_DEMARRAGE.md`
- Consultez `README.md`
- Ouvrez une issue

Merci pour votre contribution ! 🙏
