'use client';

import { Card } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Settings, 
  Lock, 
  Moon, 
  Sun, 
  Monitor,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et la sécurité du compte.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Apparence</h2>
              <p className="text-sm text-muted-foreground">Personnalisez l'UI pour votre confort visuel.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/60">
                 <Moon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">Mode Clair / Sombre</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sécurité</h2>
              <p className="text-sm text-muted-foreground">Identifiants de session et accès administratifs.</p>
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
                <div>
                   <p className="text-sm font-medium">Mot de passe Admin</p>
                   <p className="text-xs text-muted-foreground">Géré via les variables d'environnement.</p>
                </div>
                <Button variant="outline" size="sm" disabled>Modifier le mot de passe</Button>
             </div>
             
             <div className="flex items-center gap-2 p-3 text-xs text-amber-600 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <Info className="h-4 w-4" />
                <span>La modification du mot de passe nécessite une mise à jour des variables système.</span>
             </div>
          </div>
        </Card>

        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">État du Système</h2>
              <p className="text-sm text-muted-foreground">Vérification de la santé du backend.</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
             <div className="p-4 rounded-2xl border border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Backend API</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-bold">Opérationnel</p>
                </div>
             </div>
             <div className="p-4 rounded-2xl border border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Stockage DB</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500" />
                   <p className="text-sm font-bold">Connecté (MongoDB)</p>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
