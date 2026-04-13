'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Edit, Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'SAV' | 'D3/D1';
  subdivision?: string;
  active?: boolean;
}

interface TechnicianStats {
  total: number;
  sav: number;
  d3d1: number;
  savPercent: number;
  d3d1Percent: number;
  subdivisions: Array<{ name: string; count: number; percent: number }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function TechniciansPanel() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'SAV' as 'SAV' | 'D3/D1', subdivision: '', active: true });

  const loadData = async () => {
    try {
      setLoading(true);
      const [techRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/technicians`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/technicians/stats`, { cache: 'no-store' }),
      ]);
      const techPayload = await techRes.json().catch(() => []);
      const statsPayload = await statsRes.json().catch(() => ({}));
      if (!techRes.ok) throw new Error(techPayload.error || 'Impossible de charger les techniciens');
      setTechnicians(Array.isArray(techPayload) ? techPayload : []);
      setStats({
        total: 0,
        sav: 0,
        d3d1: 0,
        savPercent: 0,
        d3d1Percent: 0,
        ...(statsPayload || {}),
        subdivisions: Array.isArray(statsPayload?.subdivisions) ? statsPayload.subdivisions : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () =>
      technicians.filter((tech) =>
        `${tech.name} ${tech.email || ''} ${tech.phone || ''} ${tech.subdivision || ''}`.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, technicians],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', role: 'SAV', subdivision: '', active: true });
  };

  const submit = async () => {
    try {
      const url = editingId ? `${API_BASE_URL}/technicians/${editingId}` : `${API_BASE_URL}/technicians`;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Impossible de sauvegarder');
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const editTechnician = (tech: Technician) => {
    setEditingId(tech.id);
    setForm({
      name: tech.name,
      email: tech.email || '',
      phone: tech.phone || '',
      role: tech.role,
      subdivision: tech.subdivision || '',
      active: tech.active ?? true,
    });
  };

  const removeTechnician = async (id: string) => {
    await fetch(`${API_BASE_URL}/technicians/${id}`, { method: 'DELETE' });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <section className="hero-panel relative overflow-hidden p-6 md:p-8">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Techniciens
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Subdivisions et affectations</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Ajoutez les techniciens, attribuez leur subdivision et suivez la répartition SAV / D3-D1.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total" value={stats?.total ?? technicians.length} />
        <Metric label="SAV" value={stats?.sav ?? 0} suffix={`${stats?.savPercent ?? 0}%`} />
        <Metric label="D3/D1" value={stats?.d3d1 ?? 0} suffix={`${stats?.d3d1Percent ?? 0}%`} />
        <Metric label="Subdivisions" value={stats?.subdivisions.length ?? 0} />
      </div>

      <Card className="border-border/70 p-5">
        <h2 className="text-xl font-semibold">{editingId ? 'Modifier un technicien' : 'Ajouter un technicien'}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nom">
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </Field>
          <Field label="Téléphone">
            <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </Field>
          <Field label="Subdivision">
            <Input value={form.subdivision} onChange={(e) => setForm((prev) => ({ ...prev, subdivision: e.target.value }))} placeholder="Ex: Lyon Nord" />
          </Field>
          <Field label="Rôle">
            <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as 'SAV' | 'D3/D1' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAV">SAV</SelectItem>
                <SelectItem value="D3/D1">D3/D1</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Actif">
            <button
              type="button"
              className={`h-10 rounded-xl border px-4 text-left text-sm transition ${form.active ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200' : 'border-border/70 bg-muted/20 text-muted-foreground'}`}
              onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
            >
              {form.active ? 'Oui' : 'Non'}
            </button>
          </Field>
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={submit} className="rounded-full">
            {editingId ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {editingId ? 'Enregistrer' : 'Créer'}
          </Button>
          {editingId && (
            <Button variant="outline" className="rounded-full" onClick={resetForm}>
              Annuler
            </Button>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Chercher un technicien..." className="rounded-full pl-10" />
        </div>
      </div>

      <Card className="overflow-hidden border-border/70">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Subdivision</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((tech) => (
                  <tr key={tech.id} className="border-b border-border/70 hover:bg-muted/20">
                    <td className="p-4 font-medium">
                      <div>
                        <p>{tech.name}</p>
                        <p className="text-xs text-muted-foreground">{tech.email || '-'} {tech.phone ? `· ${tech.phone}` : ''}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={tech.role === 'SAV' ? 'bg-primary/10 text-primary' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200'}>
                        {tech.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{tech.subdivision || '-'}</td>
                    <td className="p-4">
                      <Badge className={tech.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}>
                        {tech.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => editTechnician(tech)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => removeTechnician(tech.id)}>
                          <Trash2 className="h-4 w-4" />
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

      <Card className="border-border/70 p-5">
        <h3 className="font-semibold">Répartition des subdivisions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stats?.subdivisions || []).map((item) => (
            <div key={item.name} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.name}</p>
                <span className="text-xs text-muted-foreground">{item.percent}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(item.percent, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.count} technicien(s)</p>
            </div>
          ))}
        </div>
      </Card>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}
