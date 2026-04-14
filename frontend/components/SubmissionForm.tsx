'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileUp,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiBaseUrl } from '@/lib/api-url';
import DocumentUploader, { UploadedDocument } from './DocumentUploader';
import FicheRenseignement from './FicheRenseignement';

type StepKey = 'info' | 'fiche' | 'documents' | 'review';

const STEPS: Array<{ key: StepKey; label: string; description: string }> = [
  { key: 'info', label: 'Coordonnées', description: 'Votre identité de base' },
  { key: 'fiche', label: 'Fiche', description: 'Les champs administratifs' },
  { key: 'documents', label: 'Documents', description: 'Les pièces jointes' },
  { key: 'review', label: 'Vérification', description: "Dernier contrôle avant l'envoi" },
];

const DOCUMENT_TYPES = [
  { id: 'identityRecto', name: "Pièce d'identité (Recto)", desc: "Carte d'identité ou passeport, bien lisible.", required: true },
  { id: 'identityVerso', name: "Pièce d'identité (Verso)", desc: "Le verso du document d'identité.", required: true },
  { id: 'photo', name: "Photo d'identité", desc: 'Photo nette, fond clair, visage de face.', required: true },
  { id: 'drivingLicenseRecto', name: 'Permis (Recto)', desc: 'Le recto de votre permis de conduire.', required: true },
  { id: 'drivingLicenseVerso', name: 'Permis (Verso)', desc: 'Le verso de votre permis de conduire.', required: true },
  { id: 'bankDetails', name: 'RIB officiel', desc: 'Document bancaire avec votre nom.', required: true },
  { id: 'healthInsurance', name: 'Mutuelle / SS', desc: 'Justificatif mutuelle et numéro SS.', required: false },
  { id: 'medicalCertificate', name: 'Certificat médical', desc: 'Daté de moins de 2 ans.', required: false },
];

const EMPTY_DOCUMENTS: Record<string, UploadedDocument | undefined> = {
  identityRecto: undefined,
  identityVerso: undefined,
  photo: undefined,
  drivingLicenseRecto: undefined,
  drivingLicenseVerso: undefined,
  bankDetails: undefined,
  healthInsurance: undefined,
  medicalCertificate: undefined,
};

export default function SubmissionForm() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [documents, setDocuments] = useState<Record<string, UploadedDocument | undefined>>(EMPTY_DOCUMENTS);
  const [ficheFile, setFicheFile] = useState<UploadedDocument | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<StepKey>('info');

  const requiredDocsCompleted = useMemo(
    () => DOCUMENT_TYPES.filter((d) => d.required).every((d) => Boolean(documents[d.id])),
    [documents],
  );

  const selectedDocs = useMemo(
    () => Object.entries(documents).filter(([, doc]) => Boolean(doc)),
    [documents],
  );

  const completion = useMemo(() => {
    const personal = Boolean(formData.firstName && formData.lastName && formData.email && formData.phone);
    const fiche = Boolean(ficheFile);
    const docs = requiredDocsCompleted;
    const review = personal && fiche && docs;
    return { personal, fiche, docs, review };
  }, [ficheFile, formData, requiredDocsCompleted]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = (docId: string, file: File) => {
    setDocuments((prev) => ({
      ...prev,
      [docId]: { id: docId, name: file.name, type: file.type, file, uploadProgress: 100 },
    }));
  };

  const handleDocumentRemove = (docId: string) => {
    setDocuments((prev) => ({ ...prev, [docId]: undefined }));
  };

  const handleFicheUpload = (file: File) => {
    setFicheFile({ id: 'fiche', name: file.name, type: file.type, file, uploadProgress: 100 });
  };

  const handleFicheRemove = () => {
    setFicheFile(undefined);
  };

  const downloadFicheTemplate = () => {
    const link = document.createElement('a');
    link.href = '/files/fiche-renseignement.pdf';
    link.download = 'fiche-renseignement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      if (!completion.review) {
        throw new Error('Veuillez compléter tous les champs obligatoires.');
      }

      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);

      if (ficheFile) {
        submitData.append('fiche', ficheFile.file);
      }

      Object.entries(documents).forEach(([key, doc]) => {
        if (doc) submitData.append(`documents[${key}]`, doc.file);
      });

      const response = await fetch(`${getApiBaseUrl()}/submissions`, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || payload.message || "Erreur lors de l'envoi");
      }

      setSubmitStatus('success');
      setTimeout(() => {
        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
        setDocuments(EMPTY_DOCUMENTS);
        setFicheFile(undefined);
        setCurrentStep('info');
        setSubmitStatus('idle');
      }, 1800);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = (step: StepKey) => setCurrentStep(step);

  const summaryRows = [
    { label: 'Nom complet', value: `${formData.firstName} ${formData.lastName}`.trim() || '—' },
    { label: 'Email', value: formData.email || '—' },
    { label: 'Téléphone', value: formData.phone || '—' },
    { label: 'Fiche de renseignement', value: ficheFile?.name || '—' },
    { label: 'Documents', value: `${selectedDocs.length}` },
  ];

  return (
    <div className="page-transition mx-auto max-w-7xl">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">

          {/* ── Hero panel ── */}
          <section className="hero-panel relative overflow-hidden p-6 md:p-8">
            <div className="soft-grid absolute inset-0 opacity-40" />
            <div className="relative flex flex-col gap-6">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Portail de soumission sécurisé
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      Soumettre un dossier en quelques étapes.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                      Une interface plus courte, plus claire et plus agréable à utiliser sur mobile comme sur desktop.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 rounded-2xl border border-border/70 bg-card/80 p-4 text-sm shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Données protégées
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Sauvegarde en temps réel
                  </div>
                </div>
              </div>

              {/* ── Step indicators — FIXED done logic ── */}
              <div className="grid gap-3 sm:grid-cols-4">
                {STEPS.map((step, index) => {
                  const active = step.key === currentStep;
                  // A step is "done" only if its index is strictly before the current step index
                  const done = index < currentStepIndex;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => goTo(step.key)}
                      className={`rounded-2xl border p-4 text-left transition-all duration-300 ${active
                        ? 'border-primary/40 bg-primary/10 shadow-md shadow-primary/10'
                        : done
                          ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/15'
                          : 'border-border/70 bg-background/70 hover:border-primary/30 hover:bg-muted/30'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{step.label}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Progress bar ── */}
              <div className="space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Étape {currentStepIndex + 1} sur {STEPS.length}</span>
                  <span>Mode clair/sombre disponible en haut de page</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Toast: success ── */}
          {submitStatus === 'success' && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">Succès</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-200">Votre dossier a bien été envoyé.</p>
              </div>
            </div>
          )}

          {/* ── Toast: error ── */}
          {submitStatus === 'error' && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-900 shadow-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">Erreur</h3>
                <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
              </div>
              <button type="button" onClick={() => setSubmitStatus('idle')} className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Step 1 — Coordonnées */}
            {currentStep === 'info' && (
              <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold md:text-2xl">Vos informations</h2>
                    <p className="text-sm text-muted-foreground">Le premier bloc, en version compacte.</p>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Prénom" htmlFor="firstName">
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Jean" />
                  </Field>
                  <Field label="Nom" htmlFor="lastName">
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Dupont" />
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="jean@example.com" />
                  </Field>
                  <Field label="Téléphone" htmlFor="phone">
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+33 6 12 34 56 78" />
                  </Field>
                </div>
              </Card>
            )}

            {/* Step 2 — Fiche */}
            {currentStep === 'fiche' && (
              <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold md:text-2xl">Fiche de renseignement</h2>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez, complétez et renvoyez la fiche
                    </p>
                  </div>
                  <FileUp className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-4">
                  {/* Download Section */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-6">
                    <h3 className="mb-3 font-semibold">Étape 1 : Télécharger la fiche</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadFicheTemplate}
                      className="w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le modèle
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Un fichier PDF s'ouvrira. Vous pouvez le remplir dans Adobe Reader, Preview ou tout autre lecteur PDF.
                    </p>
                  </div>

                  {/* Upload Section */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-6">
                    <h3 className="mb-3 font-semibold">Étape 2 : Renvoyer la fiche complétée</h3>
                    
                    {ficheFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/15">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                {ficheFile.name}
                              </p>
                              <p className="text-xs text-emerald-700 dark:text-emerald-200">
                                Fichier prêt à être envoyé
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleFicheRemove}
                            className="opacity-70 hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Vous pouvez modifier ou remplacer le fichier en cliquant sur le bouton ci-dessous.
                        </p>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="rounded-xl border-2 border-dashed border-border/70 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
                          <FileUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Cliquez pour sélectionner la fiche</p>
                          <p className="text-xs text-muted-foreground">ou glissez-déposez le fichier ici</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) handleFicheUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </Card>
            )}
            {/* Step 3 — Documents */}
            {currentStep === 'documents' && (
              <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold md:text-2xl">Vos documents</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocs.length} / {DOCUMENT_TYPES.filter((d) => d.required).length} pièces sélectionnées
                    </p>
                  </div>
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {DOCUMENT_TYPES.map((dt) => (
                    <div key={dt.id} className="rounded-2xl border border-border/70 p-1">
                      <DocumentUploader
                        docType={dt.name}
                        required={dt.required}
                        document={documents[dt.id]}
                        onUpload={(file) => handleDocumentUpload(dt.id, file)}
                        onRemove={() => handleDocumentRemove(dt.id)}
                      />
                      <p className="px-3 pb-3 pt-2 text-xs text-muted-foreground">{dt.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 4 — Review */}
            {currentStep === 'review' && (
              <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 md:p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold md:text-2xl">Vérification finale</h2>
                  <p className="text-sm text-muted-foreground">Un récapitulatif avant l'envoi final.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/70">
                  <table className="w-full text-sm">
                    <tbody>
                      {summaryRows.map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'}>
                          <td className="w-1/3 px-4 py-3 font-medium text-muted-foreground">{row.label}</td>
                          <td className="px-4 py-3">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm font-medium">Documents prêts</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {selectedDocs.map(([key, doc]) => (
                      <div key={key} className="rounded-xl border border-border/70 bg-background/80 p-3">
                        <p className="text-sm font-medium">{doc?.name}</p>
                        <p className="text-xs text-muted-foreground">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* ── Navigation bar ── */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm sm:flex-row">
              {currentStep !== 'info' && (
                <Button
                  type="button"
                  variant="outline"
                  className="sm:w-40"
                  onClick={() => {
                    if (currentStep === 'fiche') goTo('info');
                    if (currentStep === 'documents') goTo('fiche');
                    if (currentStep === 'review') goTo('documents');
                  }}
                >
                  Retour
                </Button>
              )}

              {currentStep === 'info' && (
                <Button type="button" className="sm:ml-auto sm:w-40" onClick={() => goTo('fiche')}>
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 'fiche' && (
                <Button
                  type="button"
                  className="sm:ml-auto sm:w-40"
                  disabled={!completion.fiche}
                  onClick={() => goTo('documents')}
                >
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 'documents' && (
                <Button
                  type="button"
                  className="sm:ml-auto sm:w-40"
                  disabled={!requiredDocsCompleted}
                  onClick={() => goTo('review')}
                >
                  Vérifier <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 'review' && (
                <Button
                  type="submit"
                  className="sm:ml-auto sm:w-40"
                  disabled={!completion.review || submitting}
                >
                  {submitting ? 'Envoi…' : 'Soumettre'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <Card className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Contrôle rapide</h3>
                <p className="text-sm text-muted-foreground">Ce qui est prêt avant l'envoi.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Coordonnées', ok: completion.personal },
                { label: 'Fiche', ok: completion.fiche },
                { label: 'Documents requis', ok: completion.docs },
                { label: 'Envoi final', ok: completion.review },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 px-3 py-2"
                >
                  <span className="text-sm">{item.label}</span>
                  {item.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-5">
            <h3 className="font-semibold">Aperçu</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {summaryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}