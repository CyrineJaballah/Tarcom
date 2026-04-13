/**
 * PDF Generation Utility
 * 
 * Structure prête pour générer le PDF de la Fiche de Renseignement
 * À connecter à une bibliothèque PDF côté serveur (jsPDF, PDFKit, etc.)
 * et à une base de données MongoDB après configuration
 */

export interface FicheRenseignementData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  socialSecurityNumber: string;
  healthMutual: string;
  healthMutualNumber: string;
  drivingLicense: string;
  licenseExpiryDate: string;
  vehicleType: string;
}

/**
 * Format les données de la fiche pour le PDF
 */
export function formatFicheDataForPDF(data: FicheRenseignementData): string {
  return `
FICHE DE RENSEIGNEMENT

IDENTITÉ
--------
Prénom: ${data.firstName}
Nom: ${data.lastName}
Date de naissance: ${data.dateOfBirth}
Lieu de naissance: ${data.placeOfBirth}
Nationalité: ${data.nationality}

ADRESSE
-------
${data.address}
${data.postalCode} ${data.city}

CONTACT
-------
Email: ${data.email}
Téléphone: ${data.phone}

PERSONNE À CONTACTER EN URGENCE
-------------------------------
Nom: ${data.emergencyName}
Téléphone: ${data.emergencyPhone}
Lien de parenté: ${data.emergencyRelation}

SÉCURITÉ SOCIALE ET MUTUELLE
----------------------------
Numéro SS: ${data.socialSecurityNumber || 'Non renseigné'}
Mutuelle: ${data.healthMutual || 'Non renseignée'}
Numéro de mutuelle: ${data.healthMutualNumber || 'Non renseigné'}

PERMIS DE CONDUIRE
------------------
Numéro: ${data.drivingLicense || 'Non renseigné'}
Date d'expiration: ${data.licenseExpiryDate || 'Non renseignée'}
Catégorie: ${data.vehicleType || 'Non renseignée'}
  `.trim();
}

/**
 * TODO: Implémentation avec jsPDF ou une autre bibliothèque
 * Exemple avec jsPDF:
 * 
 * import jsPDF from 'jspdf';
 * 
 * export async function generateFichePDF(data: FicheRenseignementData): Promise<Buffer> {
 *   const doc = new jsPDF();
 *   const formattedText = formatFicheDataForPDF(data);
 *   
 *   doc.text('FICHE DE RENSEIGNEMENT', 105, 15, { align: 'center' });
 *   doc.setFontSize(10);
 *   doc.text(formattedText, 15, 30);
 *   
 *   return Buffer.from(doc.output('arraybuffer'));
 * }
 */

/**
 * Prépare les données pour l'API de génération PDF côté serveur
 */
export function preparePDFGenerationPayload(ficheData: FicheRenseignementData) {
  return {
    title: 'FICHE_DE_RENSEIGNEMENT',
    fileName: `Fiche_${ficheData.lastName}_${ficheData.firstName}_${new Date().toISOString().split('T')[0]}.pdf`,
    data: ficheData,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Génère le nom de fichier pour le PDF
 */
export function generatePDFFileName(firstName: string, lastName: string): string {
  const sanitized = `${lastName}_${firstName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `Fiche_${sanitized}_${date}.pdf`;
}
