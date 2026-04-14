'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiBaseUrl } from '@/lib/api-url';
import { Textarea } from '@/components/ui/textarea';
import {
  Archive,
  ArrowRight,
  Ban,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  PauseCircle,
  RefreshCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'hold';

interface DocumentInfo {
  documentType: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt?: string;
  status?: string;
}

interface FicheRenseignement {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  socialSecurityNumber?: string;
  healthMutual?: string;
  healthMutualNumber?: string;
  drivingLicense?: string;
  licenseExpiryDate?: string;
}

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  createdAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  ficheRenseignement?: FicheRenseignement;
  documents?: Record<string, DocumentInfo>;
}

interface TechnicianStats {
  total: number;
  sav: number;
  d3d1: number;
  savPercent: number;
  d3d1Percent: number;
  subdivisions: Array<{ name: string; count: number; percent: number }>;
}

interface SubmissionEditDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ficheRenseignement: FicheRenseignement;
}

const API_BASE_URL = getApiBaseUrl();
const DOC_ORDER = ['fiche', 'identityRecto', 'identityVerso', 'photo', 'drivingLicenseRecto', 'drivingLicenseVerso', 'bankDetails', 'healthInsurance', 'medicalCertificate'];

const labelOf = (status: SubmissionStatus) =>
  status === 'approved' ? 'Approuvé' : status === 'rejected' ? 'Rejeté' : status === 'hold' ? 'En pause' : 'En attente';

const documentLabel = (docType: string): string => {
  const labels: Record<string, string> = {
    fiche: 'Fiche de renseignement',
    identityRecto: "Pièce d'identité (Recto)",
    identityVerso: "Pièce d'identité (Verso)",
    photo: "Photo d'identité",
    drivingLicenseRecto: 'Permis (Recto)',
    drivingLicenseVerso: 'Permis (Verso)',
    bankDetails: 'RIB officiel',
    healthInsurance: 'Mutuelle / SS',
    medicalCertificate: 'Certificat médical',
  };
  return labels[docType] || docType;
};

const badgeClassOf = (status: SubmissionStatus) =>
  status === 'approved'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    : status === 'rejected'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : status === 'hold'
        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';

const fmtDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const fmtSize = (value?: number) => {
  if (!value) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const emptyFiche = (): FicheRenseignement => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  nationality: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  socialSecurityNumber: '',
  healthMutual: '',
  healthMutualNumber: '',
  drivingLicense: '',
  licenseExpiryDate: '',
});

const emptyTechStats = (): TechnicianStats => ({
  total: 0,
  sav: 0,
  d3d1: 0,
  savPercent: 0,
  d3d1Percent: 0,
  subdivisions: [],
});

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [techStats, setTechStats] = useState<TechnicianStats>(emptyTechStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [actionState, setActionState] = useState<{ id: string; status: SubmissionStatus } | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editDraft, setEditDraft] = useState<SubmissionEditDraft>({ firstName: '', lastName: '', email: '', phone: '', ficheRenseignement: emptyFiche() });
  const [archiveTarget, setArchiveTarget] = useState<Submission | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<'approved' | 'cancelled'>('approved');
  const [archiveReason, setArchiveReason] = useState('');

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const [response, statsResponse] = await Promise.all([
        fetch('/api/submissions?status=all', { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/technicians/stats`, { cache: 'no-store' }),
      ]);
      const payload = await response.json().catch(() => ({}));
      const statsPayload = await statsResponse.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.message || 'Impossible de charger les dossiers');
      setSubmissions(
        [...(payload as Submission[])].sort(
          (a, b) => new Date(b.submittedAt || b.createdAt || '').getTime() - new Date(a.submittedAt || a.createdAt || '').getTime(),
        ),
      );
      setTechStats({
        ...emptyTechStats(),
        ...(statsPayload || {}),
        subdivisions: Array.isArray(statsPayload?.subdivisions) ? statsPayload.subdivisions : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (!selectedSubmission?.documents) return setPreviewUrls({});
    const objectUrls: string[] = [];
    let active = true;

    (async () => {
      const documents = selectedSubmission.documents ?? {};
      const entries = await Promise.all(
        Object.entries(documents).map(async ([key, doc]) => {
          if (!doc?.fileId || !doc.contentType) return null;
          const previewable = doc.contentType.startsWith('image/') || doc.contentType === 'application/pdf';
          if (!previewable) return null;
          const res = await fetch(`${API_BASE_URL}/files/${doc.fileId}`);
          if (!res.ok) return null;
          const url = URL.createObjectURL(await res.blob());
          objectUrls.push(url);
          return [key, url] as const;
        }),
      );
      if (active) setPreviewUrls(Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, string]>));
    })();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedSubmission]);

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        const fiche = submission.ficheRenseignement;
        const searchTarget = [submission.firstName, submission.lastName, submission.email, submission.phone, fiche?.city, fiche?.drivingLicense]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchTarget.includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || submission.status === statusFilter);
      }),
    [searchTerm, statusFilter, submissions],
  );

  const counts = useMemo(
    () => ({
      total: submissions.length,
      pending: submissions.filter((s) => s.status === 'pending').length,
      hold: submissions.filter((s) => s.status === 'hold').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    }),
    [submissions],
  );

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      setActionState({ id, status });
      const response = await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Impossible de mettre à jour le statut');
      setSubmissions((current) => current.map((item) => (item.id === id ? { ...item, ...payload } : item)));
      setSelectedSubmission((current) => (current?.id === id ? { ...current, ...payload } : current));
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
    } finally {
      setActionState(null);
    }
  };

  const openEditDialog = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditDraft({
      firstName: submission.firstName || '',
      lastName: submission.lastName || '',
      email: submission.email || '',
      phone: submission.phone || '',
      ficheRenseignement: {
        ...emptyFiche(),
        ...(submission.ficheRenseignement || {}),
      },
    });
  };

  const saveEdit = async () => {
    if (!editingSubmission) return;

    try {
      setActionState({ id: editingSubmission.id, status: editingSubmission.status });
      const response = await fetch(`${API_BASE_URL}/submissions/${editingSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSubmission.id,
          firstName: editDraft.firstName,
          lastName: editDraft.lastName,
          email: editDraft.email,
          phone: editDraft.phone,
          ficheRenseignement: editDraft.ficheRenseignement,
          documents: editingSubmission.documents || {},
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Impossible d’enregistrer les modifications');
      setEditingSubmission(null);
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de modification');
    } finally {
      setActionState(null);
    }
  };

  const openArchiveDialog = (submission: Submission) => {
    setArchiveTarget(submission);
    setArchiveStatus('approved');
    setArchiveReason('');
  };

  const archiveSubmission = async () => {
    if (!archiveTarget) return;

    try {
      setActionState({ id: archiveTarget.id, status: archiveTarget.status });
      const response = await fetch(`${API_BASE_URL}/submissions/${archiveTarget.id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archiveStatus,
          reason: archiveReason,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Impossible d’archiver le dossier');
      setArchiveTarget(null);
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d’archivage');
    } finally {
      setActionState(null);
    }
  };

  const getDocumentByType = (submission: Submission, type: string) =>
    Object.values(submission.documents || {}).find((doc) => doc.documentType === type);

  const exportToExcel = (items: Submission[], fileName = 'tarcom-dossiers') => {
    const rows = items
      .map((submission) => {
        const fiche = submission.ficheRenseignement || {};
        const docs = Object.values(submission.documents || {});
        return `
          <tr>
            <td>${submission.id}</td><td>${submission.firstName} ${submission.lastName}</td><td>${submission.email}</td><td>${submission.phone}</td>
            <td>${submission.status}</td><td>${fmtDate(submission.submittedAt || submission.createdAt)}</td><td>${fiche.dateOfBirth || ''}</td>
            <td>${fiche.placeOfBirth || ''}</td><td>${fiche.nationality || ''}</td><td>${fiche.address || ''}</td><td>${fiche.city || ''}</td>
            <td>${fiche.postalCode || ''}</td><td>${fiche.drivingLicense || ''}</td><td>${fiche.licenseExpiryDate || ''}</td>
            <td>${fiche.emergencyName || ''}</td><td>${fiche.emergencyPhone || ''}</td><td>${fiche.emergencyRelation || ''}</td>
            <td>${fiche.socialSecurityNumber || ''}</td><td>${fiche.healthMutual || ''}</td><td>${fiche.healthMutualNumber || ''}</td>
            <td>${docs.length}</td><td>${docs.map((doc) => `${doc.documentType}: ${API_BASE_URL}/files/${doc.fileId}`).join(' | ')}</td>
          </tr>`;
      })
      .join('');
    const html = `<html><head><meta charset="utf-8" /></head><body><table border="1">
      <tr><th>ID</th><th>Nom complet</th><th>Email</th><th>Téléphone</th><th>Statut</th><th>Soumis le</th><th>Date de naissance</th><th>Lieu de naissance</th><th>Nationalité</th><th>Adresse</th><th>Ville</th><th>Code postal</th><th>Permis</th><th>Expiration permis</th><th>Contact urgence</th><th>Téléphone urgence</th><th>Lien urgence</th><th>SS</th><th>Mutuelle</th><th>N° mutuelle</th><th>Documents</th><th>Liens documents</th></tr>${rows}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="hero-panel relative overflow-hidden p-6 md:p-8">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Administration Tarcom
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Dossiers Tarcom</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                Consultez, prévisualisez et traitez les dossiers avec des transitions plus douces et des actions rapides.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={loadSubmissions} className="rounded-full">
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button variant="outline" onClick={() => exportToExcel(submissions)} className="rounded-full" disabled={!submissions.length}>
              <Download className="mr-2 h-4 w-4" />
              Exporter tout
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ['Total', counts.total, 'primary'],
          ['En attente', counts.pending, 'amber'],
          ['En pause', counts.hold, 'slate'],
          ['Approuvés', counts.approved, 'emerald'],
          ['Rejetés', counts.rejected, 'red'],
        ].map(([label, value, tone]) => (
          <Card key={label as string} className="animate-in fade-in slide-in-from-bottom-3 duration-300 border-border/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">{label as string}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-bold">{value as number}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone === 'primary' ? 'bg-primary/10 text-primary' : tone === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : tone === 'slate' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}`}>
                {label as string}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Techniciens</h2>
            <p className="text-sm text-muted-foreground">Répartition SAV / D3-D1 et subdivisions affectées.</p>
          </div>
          <Button variant="outline" asChild className="rounded-full">
            <a href="/admin/technicians">
              <Users className="mr-2 h-4 w-4" />
              Gérer les techniciens
            </a>
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Metric label="Total" value={techStats.total} />
          <Metric label="SAV" value={techStats.sav} suffix={`${techStats.savPercent}%`} />
          <Metric label="D3/D1" value={techStats.d3d1} suffix={`${techStats.d3d1Percent}%`} />
          <Metric label="Subdivisions" value={techStats.subdivisions.length} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {techStats.subdivisions.slice(0, 6).map((item) => (
            <div key={item.name} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.name}</p>
                <span className="text-xs text-muted-foreground">{item.percent}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(item.percent, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.count} technicien(s)</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} placeholder="Chercher par nom, email, ville ou permis..." className="rounded-full pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | SubmissionStatus)}>
          <SelectTrigger className="w-full rounded-full md:w-52">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="hold">En pause</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-border/70">
        {loading ? (
          <div className="animate-pulse p-8 text-center text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucun dossier trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Téléphone</th>
                  <th className="p-4">Docs</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => (
                  <tr key={submission.id} className={`group border-b border-border/70 transition-all duration-300 hover:bg-muted/20 ${index % 2 === 0 ? 'bg-background/30' : 'bg-background/10'}`}>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                          {getDocumentByType(submission, 'photo') ? (
                            <img
                              src={`${API_BASE_URL}/files/${getDocumentByType(submission, 'photo')?.fileId}`}
                              alt={`${submission.firstName} ${submission.lastName} photo`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                              {submission.firstName?.[0]}
                              {submission.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p>{submission.firstName} {submission.lastName}</p>
                          <p className="text-xs text-muted-foreground">#{submission.id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">
                            Photo: {getDocumentByType(submission, 'photo')?.fileName ? 'Disponible' : 'Manquante'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{submission.email}</td>
                    <td className="p-4 text-sm">{submission.phone}</td>
                    <td className="p-4 text-sm"><span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{Object.keys(submission.documents || {}).length} fichiers</span></td>
                    <td className="p-4"><Badge className={`rounded-full px-3 py-1 ${badgeClassOf(submission.status)}`}>{labelOf(submission.status)}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{fmtDate(submission.submittedAt || submission.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(submission)} className="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(submission)} className="rounded-full text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500/10">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openArchiveDialog(submission)} className="rounded-full text-amber-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-500/10">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(submission.id, 'approved')} disabled={actionState?.id === submission.id} className="rounded-full text-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/10">
                          {actionState?.id === submission.id && actionState.status === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(submission.id, 'hold')} disabled={actionState?.id === submission.id} className="rounded-full text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-500/10">
                          {actionState?.id === submission.id && actionState.status === 'hold' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(submission.id, 'rejected')} disabled={actionState?.id === submission.id} className="rounded-full text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500/10">
                          {actionState?.id === submission.id && actionState.status === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={Boolean(selectedSubmission)} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-2xl">{selectedSubmission?.firstName} {selectedSubmission?.lastName}</DialogTitle>
            <DialogDescription>Dossier complet enregistré dans MongoDB Atlas.</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="animate-in fade-in slide-in-from-left-4 duration-300 border-border/70 p-4">
                  <h3 className="mb-3 font-semibold">Informations personnelles</h3>
                  <div className="space-y-2 text-sm">
                    <MetaRow label="Email" value={selectedSubmission.email} />
                    <MetaRow label="Téléphone" value={selectedSubmission.phone} />
                    <MetaRow label="Statut" value={labelOf(selectedSubmission.status)} />
                    <MetaRow label="Soumis le" value={fmtDate(selectedSubmission.submittedAt || selectedSubmission.createdAt)} />
                  </div>
                </Card>

                <Card className="animate-in fade-in slide-in-from-right-4 duration-300 border-border/70 p-4">
                  <h3 className="mb-3 font-semibold">Photo du dossier</h3>
                  {getDocumentByType(selectedSubmission, 'photo') && previewUrls.photo ? (
                    <img
                      src={previewUrls.photo}
                      alt={`${selectedSubmission.firstName} ${selectedSubmission.lastName} photo`}
                      className="mb-3 h-64 w-full rounded-2xl border border-border/70 object-contain bg-muted/30 transition-transform duration-300 hover:scale-[1.01]"
                    />
                  ) : getDocumentByType(selectedSubmission, 'photo') ? (
                    <div className="mb-3 flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                      Prévisualisation photo en cours de chargement...
                    </div>
                  ) : (
                    <div className="mb-3 flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                      Aucune photo disponible
                    </div>
                  )}

                  <h3 className="mb-3 mt-5 font-semibold">Fiche de renseignement</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    {[
                      ['Date de naissance', selectedSubmission.ficheRenseignement?.dateOfBirth],
                      ['Lieu de naissance', selectedSubmission.ficheRenseignement?.placeOfBirth],
                      ['Nationalité', selectedSubmission.ficheRenseignement?.nationality],
                      ['Adresse', selectedSubmission.ficheRenseignement?.address],
                      ['Ville', selectedSubmission.ficheRenseignement?.city],
                      ['Code postal', selectedSubmission.ficheRenseignement?.postalCode],
                      ['Permis', selectedSubmission.ficheRenseignement?.drivingLicense],
                      ['Expiration permis', selectedSubmission.ficheRenseignement?.licenseExpiryDate],
                    ].map(([label, value], index) => (
                      <div key={label as string} className={`rounded-xl border border-border/70 p-3 ${index % 2 === 0 ? 'bg-background/40' : 'bg-muted/20'}`}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 break-all font-medium">{value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300 border-border/70 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Documents</h3>
                    <p className="text-sm text-muted-foreground">Prévisualisation animée des fichiers du dossier.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selectedSubmission.id, 'approved')} disabled={actionState?.id === selectedSubmission.id} className="rounded-full">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selectedSubmission.id, 'hold')} disabled={actionState?.id === selectedSubmission.id} className="rounded-full">
                      <PauseCircle className="mr-2 h-4 w-4" /> Mettre en pause
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selectedSubmission.id, 'rejected')} disabled={actionState?.id === selectedSubmission.id} className="rounded-full">
                      <Ban className="mr-2 h-4 w-4" /> Rejeter
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedSubmission)} className="rounded-full">
                      <Edit3 className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openArchiveDialog(selectedSubmission)} className="rounded-full">
                      <Archive className="mr-2 h-4 w-4" /> Archiver
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToExcel([selectedSubmission], `tarcom-${selectedSubmission.id}`)} className="rounded-full">
                      <Download className="mr-2 h-4 w-4" /> Exporter
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {DOC_ORDER.filter((key) => selectedSubmission.documents?.[key]).map((key, index) => {
                    const doc = selectedSubmission.documents?.[key];
                    if (!doc) return null;
                    const previewable = doc.contentType?.startsWith('image/') || doc.contentType === 'application/pdf';
                    return (
                      <div key={key} className="animate-in fade-in slide-in-from-bottom-3 duration-300 rounded-2xl border border-border/70 p-4" style={{ animationDelay: `${index * 80}ms` }}>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{documentLabel(key)}</p>
                            <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                          </div>
                          <Badge variant="secondary">{fmtSize(doc.fileSize)}</Badge>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          {doc.contentType?.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : doc.contentType === 'application/pdf' ? <FileText className="h-4 w-4" /> : <File className="h-4 w-4" />}
                          <span>{doc.contentType}</span>
                        </div>

                        {key === 'photo' && previewUrls[key] ? (
                          <img src={previewUrls[key]} alt={doc.fileName} className="mb-3 h-56 w-full rounded-xl border border-border/70 object-contain bg-muted/30 transition-transform duration-300 hover:scale-[1.01]" />
                        ) : previewable && previewUrls[key] ? (
                          doc.contentType?.startsWith('image/') ? (
                            <img src={previewUrls[key]} alt={doc.fileName} className="mb-3 h-56 w-full rounded-xl border border-border/70 object-contain bg-muted/30 transition-transform duration-300 hover:scale-[1.01]" />
                          ) : (
                            <iframe src={previewUrls[key]} title={doc.fileName} className="mb-3 h-56 w-full rounded-xl border border-border/70 bg-muted/30" />
                          )
                        ) : (
                          <div className="mb-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                            Prévisualisation indisponible
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">ID fichier: {doc.fileId}</p>
                        <a href={`${API_BASE_URL}/files/${doc.fileId}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline">
                          Ouvrir le fichier <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingSubmission)} onOpenChange={(open) => !open && setEditingSubmission(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Modifier le dossier</DialogTitle>
            <DialogDescription>Met à jour les informations du dossier sans toucher aux documents.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Prénom</p>
              <Input value={editDraft.firstName} onChange={(e) => setEditDraft((prev) => ({ ...prev, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Nom</p>
              <Input value={editDraft.lastName} onChange={(e) => setEditDraft((prev) => ({ ...prev, lastName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <Input value={editDraft.email} onChange={(e) => setEditDraft((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Téléphone</p>
              <Input value={editDraft.phone} onChange={(e) => setEditDraft((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ['Date de naissance', 'dateOfBirth'],
              ['Lieu de naissance', 'placeOfBirth'],
              ['Nationalité', 'nationality'],
              ['Adresse', 'address'],
              ['Ville', 'city'],
              ['Code postal', 'postalCode'],
              ['Permis', 'drivingLicense'],
              ['Expiration permis', 'licenseExpiryDate'],
            ].map(([label, key]) => (
              <div key={key} className="space-y-2">
                <p className="text-sm font-medium">{label}</p>
                <Input
                  value={(editDraft.ficheRenseignement as Record<string, string>)[key] || ''}
                  onChange={(e) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      ficheRenseignement: { ...prev.ficheRenseignement, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingSubmission(null)} className="rounded-full">
              Annuler
            </Button>
            <Button onClick={saveEdit} className="rounded-full" disabled={actionState?.id === editingSubmission?.id}>
              {actionState?.id === editingSubmission?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Archiver le dossier</DialogTitle>
            <DialogDescription>Choisissez si ce dossier est archivé comme approuvé ou annulé.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Statut archive</p>
              <Select value={archiveStatus} onValueChange={(value) => setArchiveStatus(value as 'approved' | 'cancelled')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Raison</p>
              <Textarea value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} placeholder="Ajoutez une note facultative..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setArchiveTarget(null)} className="rounded-full">
              Annuler
            </Button>
            <Button onClick={archiveSubmission} className="rounded-full" disabled={actionState?.id === archiveTarget?.id}>
              {actionState?.id === archiveTarget?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Archiver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-xl border border-border/70 bg-background/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <Card className="border-border/70 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold">{value}</p>
        {suffix && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{suffix}</span>}
      </div>
    </Card>
  );
}
