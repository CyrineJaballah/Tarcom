'use client';

import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FicheRenseignementData {
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
}

interface FicheRenseignementProps {
  data: FicheRenseignementData;
  onChange: (field: string, value: string) => void;
}

type Field = {
  key: keyof FicheRenseignementData;
  label: string;
  type: string;
  required?: boolean;
  readOnly?: boolean;
};

export default function FicheRenseignement({ data, onChange }: FicheRenseignementProps) {
  const sections: Array<{ title: string; description: string; fields: Field[] }> = [
    {
      title: 'Identité',
      description: 'Les champs importants restent regroupés pour aller plus vite.',
      fields: [
        { key: 'firstName', label: 'Prénom', type: 'text', required: true, readOnly: true },
        { key: 'lastName', label: 'Nom', type: 'text', required: true, readOnly: true },
        { key: 'dateOfBirth', label: 'Date de naissance', type: 'date', required: true },
        { key: 'placeOfBirth', label: 'Lieu de naissance', type: 'text', required: true },
        { key: 'nationality', label: 'Nationalité', type: 'text', required: true },
      ],
    },
    {
      title: 'Contact',
      description: 'On reprend vos informations principales sans vous faire scroller davantage.',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true, readOnly: true },
        { key: 'phone', label: 'Téléphone', type: 'tel', required: true, readOnly: true },
        { key: 'address', label: 'Adresse', type: 'text', required: true },
        { key: 'city', label: 'Ville', type: 'text', required: true },
        { key: 'postalCode', label: 'Code postal', type: 'text', required: true },
      ],
    },
    {
      title: 'Urgence',
      description: 'Un contact rapide en cas de besoin.',
      fields: [
        { key: 'emergencyName', label: 'Nom et prénom', type: 'text', required: true },
        { key: 'emergencyPhone', label: 'Téléphone', type: 'tel', required: true },
        { key: 'emergencyRelation', label: 'Lien', type: 'text', required: true },
      ],
    },
    {
      title: 'Sécurité sociale',
      description: 'Optionnel, mais utile si vous l’avez déjà sous la main.',
      fields: [
        { key: 'socialSecurityNumber', label: 'Numéro de S.S.', type: 'text' },
        { key: 'healthMutual', label: 'Mutuelle', type: 'text' },
        { key: 'healthMutualNumber', label: 'N° mutuelle', type: 'text' },
      ],
    },
    {
      title: 'Permis',
      description: 'Renseignez les informations liées à la conduite.',
      fields: [
        { key: 'drivingLicense', label: 'Numéro de permis', type: 'text', required: true },
        { key: 'licenseExpiryDate', label: 'Date d’expiration', type: 'date', required: true },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200/70 bg-blue-50/80 p-4 text-blue-800 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          Les champs marqués d’un astérisque sont obligatoires. Le reste peut être complété plus tard si besoin.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="glass-card p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {section.fields.length} champs
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              {section.fields.map((field, index) => {
                const value = data[field.key] || '';
                return (
                  <div
                    key={field.key}
                    className={`grid gap-3 border-b border-border/70 bg-background/40 p-3 last:border-b-0 md:grid-cols-[220px_1fr] md:items-center ${
                      index % 2 === 0 ? 'md:bg-background/50' : ''
                    }`}
                  >
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={value}
                      onChange={(event) => onChange(field.key, event.target.value)}
                      placeholder={field.readOnly ? field.label : `Saisir ${field.label.toLowerCase()}`}
                      readOnly={field.readOnly}
                      disabled={field.readOnly}
                      className={`h-10 ${field.readOnly ? 'bg-muted/60 text-muted-foreground' : ''}`}
                      required={field.required}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
