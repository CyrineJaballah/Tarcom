// Document Upload Configuration
export const DOCUMENT_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  UPLOAD_TIMEOUT: 60000, // 60 seconds
};

// Email Configuration
export const EMAIL_CONFIG = {
  PROVIDER: 'SMTP',
  FROM_EMAIL: process.env.EMAIL_FROM || 'noreply@dossiers.fr',
  FROM_NAME: 'Portail de Soumission de Dossiers',
  
  // Company email for notifications
  COMPANY_INBOX: process.env.COMPANY_EMAIL || 'admin@dossiers.fr',
  
  // SMTP Configuration (if using SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};

// MongoDB Configuration
export const DB_CONFIG = {
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/documents',
  DB_NAME: 'documents',
  COLLECTIONS: {
    SUBMISSIONS: 'submissions',
    FILES: 'files',
  },
};

// API Configuration
export const API_CONFIG = {
  SUBMISSION_ENDPOINT: '/api/submissions',
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};

// Document Requirements
export const DOCUMENT_REQUIREMENTS = [
  {
    id: 'identityRecto',
    name: 'Pièce d\'identité (Recto)',
    description: 'Carte d\'identité ou passeport - claire et lisible',
    required: true,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'identityVerso',
    name: 'Pièce d\'identité (Verso)',
    description: 'Verso de la pièce d\'identité',
    required: true,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'photo',
    name: 'Photo d\'identité conforme',
    description: 'Format 4x4 cm - fond blanc - visage de face',
    required: true,
    formats: ['JPG', 'PNG', 'WEBP'],
  },
  {
    id: 'drivingLicenseRecto',
    name: 'Permis de conduire (Recto)',
    description: 'Avant du permis valide - clair et lisible',
    required: true,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'drivingLicenseVerso',
    name: 'Permis de conduire (Verso)',
    description: 'Arrière du permis valide',
    required: true,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'bankDetails',
    name: 'RIB officiel',
    description: 'Avec toutes les informations bancaires et votre nom/prénom',
    required: true,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'healthInsurance',
    name: 'Justificatif mutuelle et numéro SS',
    description: 'Document officiel de votre mutuelle et numéro de Sécurité sociale',
    required: false,
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    id: 'medicalCertificate',
    name: 'Certificat d\'Aptitude médical',
    description: 'Datant de moins de 2 ans - correspondant au métier/activité',
    required: false,
    formats: ['PDF', 'JPG', 'PNG'],
  },
];
