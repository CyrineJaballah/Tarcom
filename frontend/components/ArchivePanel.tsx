'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, Filter, Image as ImageIcon, Search, Sparkles } from 'lucide-react';

type ArchiveStatus = 'approved' | 'cancelled';

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
  archiveStatus?: ArchiveStatus;
  archivedAt?: string;
  archiveReason?: string;
  documents?: Record<string, DocumentInfo>;
  ficheRenseignement?: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

export default function ArchivePanel() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | ArchiveStatus>('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/submissions?archived=true`, { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Impossible de charger l’archive');
        setItems(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected?.documents?.photo?.fileId) {
      setPreviewUrl('');
      return;
    }

    let active = true;
    const controller = new AbortController();

    (async () => {
      const res = await fetch(`${API_BASE_URL}/files/${selected.documents!.photo!.fileId}`, { signal: controller.signal });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      if (active) setPreviewUrl(url);
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selected]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const search = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`.toLowerCase();
        return search.includes(searchTerm.toLowerCase()) && (filter === 'all' || item.archiveStatus === filter);
      }),
    [filter, items, searchTerm],
  );

  const total = items.length;
  const approved = items.filter((item) => item.archiveStatus === 'approved').length;
  const cancelled = items.filter((item) => item.archiveStatus === 'cancelled').length;
  const approvedPct = total ? Math.round((approved / total) * 100) : 0;
  const cancelledPct = total ? Math.round((cancelled / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="hero-panel relative overflow-hidden p-6 md:p-8">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Archive
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Dossiers archivés</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Suivez ce qui a été archivé en approuvé ou annulé, avec des filtres clairs et des pourcentages visibles.
            </p>
          </div>
          <Button variant="outline" className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total archivé" value={total} />
        <Metric label="Approuvé" value={approved} suffix={`${approvedPct}%`} />
        <Metric label="Annulé" value={cancelled} suffix={`${cancelledPct}%`} />
        <Metric label="Filtre actif" value={filter === 'all' ? 'Tous' : filter === 'approved' ? 'Approuvé' : 'Annulé'} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans l’archive..."
            className="h-10 w-full rounded-full border border-border/70 bg-background pl-10 pr-4 text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'approved', 'cancelled'] as const).map((item) => (
            <Button key={item} variant={filter === item ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter(item)}>
              <Filter className="mr-2 h-4 w-4" />
              {item === 'all' ? 'Tous' : item === 'approved' ? 'Approuvé' : 'Annulé'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-border/70">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucun dossier archivé trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Statut archive</th>
                  <th className="p-4">Date archive</th>
                  <th className="p-4">Raison</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/70 hover:bg-muted/20">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-3">
                        {item.documents?.photo?.fileId ? (
                          <img
                            src={`${API_BASE_URL}/files/${item.documents.photo.fileId}`}
                            alt={`${item.firstName} ${item.lastName}`}
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p>{item.firstName} {item.lastName}</p>
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`rounded-full px-3 py-1 ${item.archiveStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {item.archiveStatus === 'approved' ? 'Approuvé' : 'Annulé'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{fmtDate(item.archivedAt)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{item.archiveReason || '-'}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSelected(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected?.firstName} {selected?.lastName}</DialogTitle>
            <DialogDescription>Dossier archivé.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 p-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="Photo" className="h-72 w-full rounded-xl object-contain" />
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border/70 text-muted-foreground">
                    Photo non disponible
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 p-4">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p className="font-medium">{selected.archiveStatus === 'approved' ? 'Approuvé' : 'Annulé'}</p>
                </div>
                <div className="rounded-2xl border border-border/70 p-4">
                  <p className="text-xs text-muted-foreground">Date d’archive</p>
                  <p className="font-medium">{fmtDate(selected.archivedAt)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 p-4">
                  <p className="text-xs text-muted-foreground">Raison</p>
                  <p className="font-medium">{selected.archiveReason || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
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
