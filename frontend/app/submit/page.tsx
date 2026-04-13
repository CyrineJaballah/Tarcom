'use client';

import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';
import SubmissionForm from '@/components/SubmissionForm';
import ThemeToggle from '@/components/ThemeToggle';

export default function SubmitPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Accueil
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground md:flex">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Soumission guidée
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:px-8 md:py-10">
        <div className="mb-6 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Formulaire modernisé
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Soumettre mon dossier</h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Une version plus compacte, plus lisible et responsive, pensée pour aller vite sans perdre les informations nécessaires.
          </p>
        </div>

        <SubmissionForm />
      </main>
    </div>
  );
}
