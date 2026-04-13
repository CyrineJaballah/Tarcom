export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getTechnicianConfirmationEmail(
  technicianName: string,
  submissionId: string
): EmailTemplate {
  return {
    subject: 'Document Submission Received',
    html: `
      <h2>Thank you for your submission, ${technicianName}!</h2>
      <p>We have received your document submission.</p>
      <p><strong>Submission ID:</strong> ${submissionId}</p>
      <p>We will review your documents and contact you within 2-3 business days.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br/>The HR Team</p>
    `,
    text: `
      Thank you for your submission, ${technicianName}!
      
      We have received your document submission.
      
      Submission ID: ${submissionId}
      
      We will review your documents and contact you within 2-3 business days.
      If you have any questions, please don't hesitate to contact us.
      
      Best regards,
      The HR Team
    `,
  };
}

export function getCompanyNotificationEmail(
  technicianName: string,
  email: string,
  phone: string,
  submissionId: string,
  documentsSubmitted: Record<string, boolean>
): EmailTemplate {
  const documentsList = Object.entries(documentsSubmitted)
    .filter(([, submitted]) => submitted)
    .map(([docType]) => `• ${formatDocumentType(docType)}`)
    .join('\n');

  return {
    subject: `New Document Submission: ${technicianName}`,
    html: `
      <h2>New Document Submission</h2>
      <p><strong>Technician:</strong> ${technicianName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Submission ID:</strong> ${submissionId}</p>
      
      <h3>Documents Submitted:</h3>
      <ul>
        ${Object.entries(documentsSubmitted)
          .filter(([, submitted]) => submitted)
          .map(([docType]) => `<li>${formatDocumentType(docType)}</li>`)
          .join('')}
      </ul>
      
      <p><a href="/admin">View submission in admin panel</a></p>
    `,
    text: `
      New Document Submission
      
      Technician: ${technicianName}
      Email: ${email}
      Phone: ${phone}
      Submission ID: ${submissionId}
      
      Documents Submitted:
      ${documentsList}
    `,
  };
}

function formatDocumentType(type: string): string {
  const mapping: Record<string, string> = {
    identity: 'Identity Document',
    drivingLicense: 'Driving License',
    photo: 'Identity Photo',
    bankDetails: 'Bank Details (RIB)',
    medicalCert: 'Medical Certificate',
    infoForm: 'Information Form',
  };
  return mapping[type] || type;
}
