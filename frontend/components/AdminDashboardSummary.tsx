'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { getApiBaseUrl } from '@/lib/api-url';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const API_BASE_URL = getApiBaseUrl();

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboardSummary() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchWithRetry(`${API_BASE_URL}/submissions?status=all`);
        if (!res.ok) return;
        const data = await res.json();
        const total = data.length;
        const pending = data.filter((s: any) => s.status === 'pending' || s.status === 'hold').length;
        const approved = data.filter((s: any) => s.status === 'approved').length;
        const rejected = data.filter((s: any) => s.status === 'rejected').length;
        setStats({ total, pending, approved, rejected });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Dossiers', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'En Attente', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Approuvés', value: stats.approved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Rejetés', value: stats.rejected, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-8">
      <section className="hero-panel relative overflow-hidden p-8 rounded-3xl">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Tableau de bord haute performance
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Bienvenue, <span className="text-primary">Admin</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Voici un aperçu de l'activité récente sur la plateforme Tarcom.
            </p>
          </div>
          <div className="flex gap-3">
             <Button className="rounded-full shadow-lg shadow-primary/20" asChild>
                <Link href="/admin/submissions">
                  Voir tous les dossiers <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={card.label} className="group relative overflow-hidden border-border/60 p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
             <div className={`absolute right-4 top-4 rounded-2xl ${card.bg} p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-4xl font-bold tracking-tight">
                     {loading ? '...' : card.value}
                   </h2>
                </div>
             </div>
             <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <BarChart3 className="mr-1 h-3 w-3" />
                <span>Mise à jour en temps réel</span>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="border-border/60 p-6">
            <h3 className="text-lg font-bold mb-4">Activité Récente</h3>
            <div className="space-y-4">
               {/* This is a visual mock for the Dashboard, real logic is in Submissions tab */}
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/40 p-4 bg-muted/5">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                       {i}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-semibold">Nouveau dossier soumis</p>
                       <p className="text-xs text-muted-foreground">Il y a {i * 10} minutes</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">INFO</Badge>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="border-border/60 p-6 bg-primary/5 border-primary/10">
            <h3 className="text-lg font-bold mb-4 text-primary">Conseils de gestion</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
               <p>• Pensez à vérifier la netteté des documents (Recto/Verso).</p>
               <p>• Approuvez les dossiers complets pour libérer de l'espace.</p>
               <p>• Les rejets doivent être suivis d'un email de notification (manuel).</p>
               <Button variant="link" className="p-0 h-auto text-primary" asChild>
                  <Link href="/admin/submissions">Aller aux dossiers →</Link>
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
