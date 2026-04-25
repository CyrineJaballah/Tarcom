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
import { fetchWithRetry } from '@/lib/fetch-retry';
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
  Trash2,
  X,
} from 'lucide-react';

const API_BASE_URL = getApiBaseUrl();

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'hold';

interface DocumentInfo {
  documentType: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

interface FicheRenseignement {
  [key: string]: string | undefined;
}

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  submittedAt?: string;
  createdAt?: string;
  ficheRenseignement?: FicheRenseignement;
  documents?: Record<string, DocumentInfo>;
}

const DOC_ORDER = [
  'fiche', 'identityRecto', 'identityVerso', 'photo', 
  'drivingLicenseRecto', 'drivingLicenseVerso', 'bankDetails', 
  'healthInsurance', 'medicalCertificate'
];

const labelOf = (status: SubmissionStatus) => {
  const map: Record<SubmissionStatus, string> = {
    approved: 'Approuvé',
    rejected: 'Rejeté',
    hold: 'En pause',
    pending: 'En attente'
  };
  return map[status];
};

const badgeClassOf = (status: SubmissionStatus) => {
  const map: Record<SubmissionStatus, string> = {
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    hold: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  };
  return map[status];
};

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Detail & Action states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchWithRetry(`${API_BASE_URL}/submissions?status=all`, { cache: 'no-store' });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload.error || 'Impossible de charger les dossiers');
      
      const sorted = (payload as Submission[]).sort((a, b) => 
        new Date(b.submittedAt || b.createdAt || '').getTime() - 
        new Date(a.submittedAt || a.createdAt || '').getTime()
      );
      setSubmissions(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Previews cleanup
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const fetchPreview = async (fileId: string, key: string) => {
    try {
      if (previewUrls[key]) return;
      const res = await fetchWithRetry(`${API_BASE_URL}/files/${fileId}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrls(prev => ({ ...prev, [key]: url }));
    } catch (e) {
      console.error('Preview error', e);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch = [s.firstName, s.lastName, s.email, s.phone]
        .join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      setActionLoading(id);
      const res = await fetchWithRetry(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Erreur de mise à jour');
      await loadSubmissions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFile = async (submissionId: string, fileId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    try {
      setActionLoading(fileId);
      const res = await fetchWithRetry(`${API_BASE_URL}/submissions/${submissionId}/files/${fileId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      await loadSubmissions();
      // Update selected submission if open
      if (selectedSubmission?.id === submissionId) {
        const updated = await fetchWithRetry(`${API_BASE_URL}/submissions/${submissionId}`);
        if (updated.ok) setSelectedSubmission(await updated.json());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const exportToExcel = () => {
    const headers = ["ID", "Nom", "Prénom", "Email", "Téléphone", "Statut", "Date"];
    const rows = filteredSubmissions.map(s => [
      s.id.slice(-6), s.lastName, s.firstName, s.email, s.phone, labelOf(s.status), 
      new Date(s.submittedAt || s.createdAt || '').toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tarcom_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Dossiers</h1>
          <p className="text-sm text-muted-foreground">Consultez et validez les soumissions des utilisateurs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadSubmissions} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={exportToExcel} disabled={filteredSubmissions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un nom, email..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Statut" />
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

      {/* Main Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Candidat</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Docs</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/40" />
                    <p className="mt-2 text-muted-foreground">Chargement des dossiers...</p>
                  </td>
                </tr>
              ) : paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground">
                    Aucun dossier trouvé.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedSubmission(s)}>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: {s.id.slice(-6)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{s.email}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(s.submittedAt || s.createdAt || '').toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="font-normal">
                        {Object.keys(s.documents || {}).length} fichiers
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`rounded-full border-none px-3 py-0.5 text-[11px] font-medium ${badgeClassOf(s.status)}`}>
                        {labelOf(s.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setSelectedSubmission(s)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-blue-600" onClick={() => setEditingSubmission(s)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
        <p>
          Affichage de {Math.min(filteredSubmissions.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(filteredSubmissions.length, currentPage * itemsPerPage)} sur {filteredSubmissions.length} dossiers
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedSubmission?.firstName} {selectedSubmission?.lastName}</DialogTitle>
            <DialogDescription>Détails complets de la soumission</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4 md:col-span-1">
                <section className="space-y-3 rounded-2xl border border-border/60 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span>Email:</span> <span className="font-medium">{selectedSubmission.email}</span></p>
                    <p className="flex justify-between"><span>Phone:</span> <span className="font-medium">{selectedSubmission.phone}</span></p>
                    <p className="flex justify-between"><span>Date:</span> <span className="font-medium">{new Date(selectedSubmission.submittedAt || selectedSubmission.createdAt || '').toLocaleString()}</span></p>
                  </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-border/60 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Décision</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/40"
                      onClick={() => updateStatus(selectedSubmission.id, 'approved')}
                      disabled={actionLoading === selectedSubmission.id}
                    >
                      Approuver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40"
                      onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                      disabled={actionLoading === selectedSubmission.id}
                    >
                      Rejeter
                    </Button>
                  </div>
                </section>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-semibold">Fichiers uploadés</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DOC_ORDER.map(key => {
                    const doc = selectedSubmission.documents?.[key];
                    if (!doc) return null;
                    const previewUrl = previewUrls[key];
                    return (
                      <div key={key} className="group relative flex flex-col rounded-2xl border border-border/60 bg-muted/10 p-3 p-4 transition-all hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border/60">
                            {doc.contentType.includes('image') ? <ImageIcon className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-red-500" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs font-medium">{doc.fileName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{key}</p>
                          </div>
                        </div>

                        {/* Actions Overlay / Preview Trigger */}
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full"
                              onClick={() => fetchPreview(doc.fileId, key)}
                              disabled={!!previewUrl}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <a href={`${API_BASE_URL}/files/${doc.fileId}`} download={doc.fileName} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => deleteFile(selectedSubmission.id, doc.fileId)}
                            disabled={actionLoading === doc.fileId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Inline Preview */}
                        {previewUrl && (
                          <div className="mt-3 relative rounded-xl border border-border overflow-hidden bg-black/5">
                            {doc.contentType.includes('image') ? (
                              <img src={previewUrl} className="max-h-40 w-full object-contain" alt="Preview" />
                            ) : (
                              <iframe src={previewUrl} className="h-40 w-full" />
                            )}
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPreviewUrls(prev => {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                              })}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit (User Info) Dialog */}
      <Dialog open={!!editingSubmission} onOpenChange={(open) => !open && setEditingSubmission(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les informations</DialogTitle>
            <DialogDescription>Modifiez les informations de base du candidat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Prénom</label>
              <Input defaultValue={editingSubmission?.firstName} id="edit-firstName" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nom</label>
              <Input defaultValue={editingSubmission?.lastName} id="edit-lastName" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
              <Input defaultValue={editingSubmission?.email} id="edit-email" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Téléphone</label>
              <Input defaultValue={editingSubmission?.phone} id="edit-phone" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingSubmission(null)}>Annuler</Button>
            <Button 
              onClick={async () => {
                const updatedData = {
                  firstName: (document.getElementById('edit-firstName') as HTMLInputElement).value,
                  lastName: (document.getElementById('edit-lastName') as HTMLInputElement).value,
                  email: (document.getElementById('edit-email') as HTMLInputElement).value,
                  phone: (document.getElementById('edit-phone') as HTMLInputElement).value,
                };
                try {
                  setActionLoading(editingSubmission!.id);
                  const res = await fetchWithRetry(`${API_BASE_URL}/submissions/${editingSubmission!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                  });
                  if (!res.ok) throw new Error('Erreur de sauvegarde');
                  setEditingSubmission(null);
                  await loadSubmissions();
                } catch (e) {
                   alert(e instanceof Error ? e.message : 'Erreur');
                } finally {
                   setActionLoading(null);
                }
              }}
              disabled={actionLoading === editingSubmission?.id}
            >
              {actionLoading === editingSubmission?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
