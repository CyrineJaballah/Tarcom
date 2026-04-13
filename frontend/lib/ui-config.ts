/**
 * Configuration centralisée de l'interface utilisateur
 * Modifiez ces valeurs pour personnaliser l'apparence
 */

export const UI_CONFIG = {
  // Brand
  BRAND_NAME: 'Dossiers',
  BRAND_TAGLINE: 'Soumettez vos documents simplement',
  
  // Formulaire
  FORM: {
    STEPS: [
      { id: 'info', label: 'Informations' },
      { id: 'documents', label: 'Documents' },
      { id: 'review', label: 'Vérification' },
    ],
    VALIDATION: {
      PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
      MIN_NAME_LENGTH: 2,
      MAX_NAME_LENGTH: 100,
    },
  },

  // Fichiers
  FILES: {
    MAX_SIZE_MB: 10,
    ALLOWED_FORMATS: ['PDF', 'JPG', 'PNG', 'DOCX'],
    TIMEOUT_SECONDS: 60,
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      TITLE: 'Succès !',
      DESCRIPTION: 'Votre dossier a été reçu. Nous le traiterons très bientôt.',
    },
    ERROR: {
      TITLE: 'Erreur',
      DESCRIPTION_DEFAULT: 'Une erreur est survenue. Veuillez réessayer.',
    },
    VALIDATION: {
      REQUIRED_FIELD: 'Ce champ est obligatoire',
      INVALID_EMAIL: 'Email invalide',
      INVALID_PHONE: 'Numéro de téléphone invalide',
      FILE_TOO_LARGE: 'Le fichier dépasse la limite de {size} Mo',
      INVALID_FORMAT: 'Format de fichier non autorisé',
    },
  },

  // Navigation
  NAVIGATION: {
    ITEMS: [
      { label: 'Accueil', href: '/' },
      { label: 'Soumettre', href: '/submit' },
      { label: 'Admin', href: '/admin' },
    ],
  },

  // Admin
  ADMIN: {
    ITEMS_PER_PAGE: 20,
    STATUS_LABELS: {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    },
  },

  // Animations
  ANIMATIONS: {
    DURATION_FAST: 200,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500,
  },

  // Spacing
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
  },

  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
} as const;

/**
 * Fonction helper pour obtenir un message d'erreur
 */
export const getErrorMessage = (key: string, params?: Record<string, any>): string => {
  let message: string = UI_CONFIG.MESSAGES.ERROR.DESCRIPTION_DEFAULT;
  
  const keys = key.split('.');
  let current: any = UI_CONFIG.MESSAGES;
  
  for (const k of keys) {
    if (current[k]) {
      current = current[k];
    }
  }
  
  if (typeof current === 'string') {
    message = current;
    
    // Remplacer les paramètres
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }
  }
  
  return message;
};

export default UI_CONFIG;
