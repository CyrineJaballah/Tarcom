'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiBaseUrl } from '@/lib/api-url';
import { fetchWithRetry } from '@/lib/fetch-retry';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  RefreshCcw,
  Search,
  Trash2,
  User,
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

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  submittedAt?: string;
  createdAt?: string;
  documents?: Record<string, DocumentInfo>;
}

const DOC_ORDER = [
  'fiche', 'identityRecto', 'identityVerso', 'photo',
  'drivingLicenseRecto', 'drivingLicenseVerso', 'bankDetails',
  'healthInsurance', 'medicalCertificate'
];

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');

  // Selected items & Modals
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [editItem, setEditItem] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchWithRetry(`${API_BASE_URL}/submissions?status=all`, { cache: 'no-store' });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error('Failed to load data');
      setSubmissions((payload as Submission[]).sort((a, b) =>
        new Date(b.submittedAt || b.createdAt || '').getTime() -
        new Date(a.submittedAt || a.createdAt || '').getTime()
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const match = [s.firstName, s.lastName, s.email, s.phone].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      return match && (statusFilter === 'all' || s.status === statusFilter);
    });
  }, [submissions, searchTerm, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      setActionLoading(id);
      await fetchWithRetry(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadData();
      if (selectedSub?.id === id) setSelectedSub(prev => prev ? ({ ...prev, status }) : null);
    } catch (e) { alert('Erreur'); }
    finally { setActionLoading(null); }
  };

  const deleteFile = async (submissionId: string, fileId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce document ? ✨')) return;
    try {
      setActionLoading(fileId);
      const res = await fetchWithRetry(`${API_BASE_URL}/submissions/${submissionId}/files/${fileId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');

      if (selectedSub) {
        const newDocs = { ...selectedSub.documents };
        Object.keys(newDocs).forEach(key => {
          if (newDocs[key]?.fileId === fileId) delete newDocs[key];
        });
        setSelectedSub({ ...selectedSub, documents: newDocs });
      }
      await loadData();
    } catch (e) {
      alert('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const forceDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetchWithRetry(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadAll = async () => {
    if (!selectedSub?.documents) return;
    const docs = Object.values(selectedSub.documents);
    for (const doc of docs) {
      await forceDownload(`${API_BASE_URL}/files/${doc.fileId}`, doc.fileName);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const exportExcel = () => {
    if (submissions.length === 0) return;
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Date Soumission'];
    const rows = submissions.map(s => [
      s.lastName, s.firstName, s.email, s.phone, s.status, 
      new Date(s.submittedAt || s.createdAt || '').toLocaleDateString('fr-FR')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `candidatures.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Attention ! Voulez-vous supprimer tout le dossier de ce candidat ? 🗑️')) return;
    try {
      setActionLoading(id);
      const res = await fetchWithRetry(`${API_BASE_URL}/submissions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur suppression dossier');
      setSelectedSub(null);
      await loadData();
    } catch (e) {
      alert('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espace Dossiers</h1>
          <p className="text-muted-foreground mt-1 underline decoration-primary/30 underline-offset-4 decoration-2">Candidatures en cours de traitement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="rounded-full shadow-sm bg-card">
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={exportExcel} className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nom, email, téléphone..."
            className="pl-10 rounded-2xl border-border/40 bg-card/60 backdrop-blur-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="md:w-[200px] rounded-2xl border-border/40 bg-card/60 backdrop-blur-sm">
            <Filter className="h-4 w-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40">
            <SelectItem value="all">Tout voir</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="hold">En pause</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-border/40 shadow-2xl shadow-black/5 rounded-[2.5rem] bg-card/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <th className="px-6 py-6">Candidat</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-6 py-6">Soumission</th>
                <th className="px-6 py-6">Docs</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary/40" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-muted-foreground">Aucun résultat ✨</td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr
                    key={s.id}
                    className="group transition-all hover:bg-primary/5 cursor-pointer"
                    onClick={() => setSelectedSub(s)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{s.firstName} {s.lastName}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground/80">
                      {new Date(s.submittedAt || s.createdAt || '').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                        {Object.keys(s.documents || {}).length}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-blue-50/50 hover:bg-blue-100"
                          onClick={(e) => { e.stopPropagation(); setEditItem(s); }}
                        >
                          <Edit3 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-red-50/50 hover:bg-red-100"
                          onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-8 py-6 border-t border-border/10 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{filtered.length} Totals</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="rounded-xl" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
            <span className="text-xs font-bold text-primary">{currentPage} / {totalPages || 1}</span>
            <Button variant="ghost" size="sm" className="rounded-xl" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      {/* ── Unified Inspection Panel ── */}
      <Dialog open={!!selectedSub} onOpenChange={v => !v && setSelectedSub(null)}>
        <DialogContent aria-describedby="dialog-description" className="max-w-[95vw] lg:max-w-7xl h-[90vh] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl bg-background/80 backdrop-blur-2xl">
          <div className="sr-only">
            <DialogTitle>Dossier de {selectedSub?.firstName}</DialogTitle>
            <DialogDescription id="dialog-description">Détails et Documents du candidat</DialogDescription>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] h-full overflow-hidden">
            {/* Main Content: Document Previews */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 space-y-12 scrollbar-thin scrollbar-thumb-primary/20">
              <div className="flex items-center justify-between border-b border-border/10 pb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedSub?.firstName} {selectedSub?.lastName}</h2>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-3 text-sm font-semibold text-muted-foreground">
                    <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {selectedSub?.email}</span>
                    <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {selectedSub?.phone}</span>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full hidden md:flex" onClick={() => setSelectedSub(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-12">
                {DOC_ORDER.map(key => {
                  const file = selectedSub?.documents?.[key];
                  if (!file) return null;
                  const fileUrl = `${API_BASE_URL}/files/${file.fileId}`;
                  const isImg = file.contentType?.includes('image');

                  return (
                    <div key={key} className="flex flex-col gap-3 group">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{key}</p>
                        <div className="flex items-center gap-2 border border-border/40 rounded-full px-3 py-1 bg-card/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <button onClick={() => forceDownload(fileUrl, file.fileName)} className="text-[10px] font-bold flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Download className="h-3 w-3" /> Save
                          </button>
                          <div className="w-[1px] h-3 bg-border/40" />
                          <button onClick={() => deleteFile(selectedSub!.id, file.fileId)} className="text-[10px] font-bold flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3 w-3" /> Del
                          </button>
                        </div>
                      </div>

                      <div className="relative aspect-[4/3] max-w-2xl mx-auto w-full rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/40 shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 ring-offset-background group-hover:ring-4 ring-primary/5">
                        {isImg ? (
                          <img src={fileUrl} className="w-full h-full object-contain p-2" alt={key} />
                        ) : file.contentType?.includes('pdf') ? (
                          <object
                            data={`${fileUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                            type="application/pdf"
                            className="w-full h-full border-none"
                          >
                            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                              <FileText className="h-8 w-8 text-primary/30 mb-2" />
                              <p className="text-[10px] font-bold text-muted-foreground/60">PDF Viewer not active</p>
                              <a href={fileUrl} download={file.fileName} className="mt-4 text-xs font-bold text-primary hover:underline">Download PDF</a>
                            </div>
                          </object>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <FileText className="h-8 w-8 text-primary/30" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 text-center px-4">Preview not supported for this type</p>
                          </div>
                        )}

                        <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {isImg ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 px-4 flex items-center justify-between max-w-2xl mx-auto w-full">
                        <span className="truncate max-w-[150px]">{file.fileName}</span>
                        <span>{(file.fileSize / 1024).toFixed(0)} KB</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Sidebar */}
            <div className="bg-muted/30 border-l border-border/10 p-6 md:p-10 flex flex-col gap-10 lg:justify-between backdrop-blur-md overflow-y-auto">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Statut Actuel</label>
                  <div className="p-1.5 bg-card/40 rounded-3xl border border-border/40 shadow-inner">
                    <StatusBadge status={selectedSub?.status || 'pending'} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Action de Décision</label>
                  <div className="grid gap-4">
                    <DecisionButton
                      icon={CheckCircle2} label="Valider" desc="Dossier approuvé ✨" color="emerald"
                      active={selectedSub?.status === 'approved'}
                      loading={actionLoading === selectedSub?.id}
                      onClick={() => updateStatus(selectedSub!.id, 'approved')}
                    />
                    <DecisionButton
                      icon={Clock3} label="En Attente" desc="Dossier en pause ⏳" color="slate"
                      active={selectedSub?.status === 'hold'}
                      loading={actionLoading === selectedSub?.id}
                      onClick={() => updateStatus(selectedSub!.id, 'hold')}
                    />
                    <DecisionButton
                      icon={Trash2} label="Refuser" desc="Rejeter le dossier ❌" color="red"
                      active={selectedSub?.status === 'rejected'}
                      loading={actionLoading === selectedSub?.id}
                      onClick={() => updateStatus(selectedSub!.id, 'rejected')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full rounded-[1.5rem] py-8 bg-black text-white hover:bg-black/80 font-bold shadow-xl flex flex-col items-center justify-center gap-1"
                  onClick={downloadAll}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Tout Télécharger</span>
                </Button>
                <Button variant="outline" className="w-full rounded-[1.5rem] py-8 border-border/40 font-bold hover:scale-[1.02] transition-transform" onClick={() => setEditItem(selectedSub)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Modifier les infos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-[1.5rem] py-6 text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-red-500"
                  onClick={() => setSelectedSub(null)}
                >
                  Fermer le panneau
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Minimal Edit Dialog ── */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent aria-describedby="edit-dialog-description" className="max-w-md rounded-[2.5rem] border-none shadow-3xl p-10 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">Modifier ✨</DialogTitle>
            <DialogDescription id="edit-dialog-description" className="sr-only">Modification des informations du candidat</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Prénom</label>
                <Input id="e-fn" defaultValue={editItem?.firstName} className="rounded-2xl border-border/40 h-12 bg-muted/40 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Nom</label>
                <Input id="e-ln" defaultValue={editItem?.lastName} className="rounded-2xl border-border/40 h-12 bg-muted/40 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Email de contact</label>
              <Input id="e-em" defaultValue={editItem?.email} className="rounded-2xl border-border/40 h-12 bg-muted/40 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Numéro de téléphone</label>
              <Input id="e-ph" defaultValue={editItem?.phone} className="rounded-2xl border-border/40 h-12 bg-muted/40 font-bold" />
            </div>
          </div>
          <Button
            className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black tracking-widest text-[10px] uppercase shadow-lg shadow-primary/20"
            onClick={async () => {
              const data = {
                firstName: (document.getElementById('e-fn') as any).value,
                lastName: (document.getElementById('e-ln') as any).value,
                email: (document.getElementById('e-em') as any).value,
                phone: (document.getElementById('e-ph') as any).value,
              };
              setActionLoading(editItem!.id);
              try {
                await fetchWithRetry(`${API_BASE_URL}/submissions/${editItem!.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                setEditItem(null);
                await loadData();
              } catch (e) { console.error(e); }
              finally { setActionLoading(null); }
            }}
          >
            {actionLoading === editItem?.id ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enregistrer les modifications'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, { label: string; class: string }> = {
    pending: { label: 'Hold ⏳', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' },
    approved: { label: 'Validé ✨', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' },
    rejected: { label: 'Refusé ❌', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' },
    hold: { label: 'Pause 🛡️', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800' }
  };
  const config = map[status];
  return (
    <Badge className={`rounded-xl border-none px-4 py-1.5 text-[10px] font-bold shadow-sm ${config.class}`}>
      {config.label}
    </Badge>
  );
}

function DecisionButton({ icon: Icon, label, desc, color, active, loading, onClick }: any) {
  const colors: any = {
    emerald: active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-[0.98]' : 'bg-card border-border/40 text-emerald-600 hover:bg-emerald-50',
    slate: active ? 'bg-slate-600 text-white shadow-xl shadow-slate-600/20 scale-[0.98]' : 'bg-card border-border/40 text-slate-600 hover:bg-slate-50',
    red: active ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[0.98]' : 'bg-card border-border/40 text-rose-600 hover:bg-rose-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left ${colors[color]} ${loading ? 'opacity-50' : 'hover:border-primary/30'}`}
    >
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-muted shadow-inner'}`}>
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest leading-tight">{label}</p>
        <p className={`text-[10px] font-bold mt-0.5 ${active ? 'text-white/70' : 'text-muted-foreground'}`}>{desc}</p>
      </div>
    </button>
  );
}
