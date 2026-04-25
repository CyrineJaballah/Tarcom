'use client';

import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Gauge, Layers3, LogOut, Shield, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';

const ADMIN_USERNAME = 'AdminTarcom';
const ADMIN_PASSWORD = 'T@rcom1234@';
const ADMIN_SESSION_KEY = 'tarcom_admin_unlocked';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/submissions', label: 'Dossiers', icon: Layers3 },
  { href: '/admin/settings', label: 'Paramètres', icon: Shield },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsUnlocked(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
    setMounted(true);
  }, []);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsUnlocked(true);
      setError('');
      setPassword('');
      return;
    }
    setError('Identifiants admin invalides.');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsUnlocked(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-8 text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Soft Background Auras */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="group mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-border/40 backdrop-blur-sm">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à l'accueil
            </Link>
            <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary shadow-xl shadow-primary/20 text-primary-foreground mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bonjour Admin ! 👋</h1>
            <p className="text-muted-foreground mt-2">Prêt à gérer vos dossiers aujourd'hui ?</p>
          </div>

          <div className="hero-panel p-8 rounded-[2.5rem] border-none shadow-2xl backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Utilisateur</label>
                <Input 
                  value={username} 
                  onChange={(event) => setUsername(event.target.value)} 
                  placeholder="AdminTarcom" 
                  className="h-12 rounded-2xl border-border/40 bg-white/50 dark:bg-black/20 focus:bg-white"
                  autoComplete="username" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</label>
                <Input 
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  type="password" 
                  placeholder="••••••••••" 
                  className="h-12 rounded-2xl border-border/40 bg-white/50 dark:bg-black/20 focus:bg-white"
                  autoComplete="current-password" 
                />
              </div>
              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200 animate-in slide-in-from-top-2">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
                Accéder au Dashboard
              </Button>
            </form>
          </div>
          
          <div className="mt-8 text-center">
             <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border/70 bg-background/70 p-5 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">Tarcom</p>
            <p className="text-xs text-muted-foreground">Admin workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Navigation</p>
            <p className="mt-1">Dashboard, archive et techniciens sont séparés.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="flex-1 rounded-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 lg:hidden">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">Tarcom</p>
              <p className="text-xs text-muted-foreground">Admin workspace</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Quitter
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto px-4 pb-4 md:px-8 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/70 bg-card/80 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
