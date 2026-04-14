'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">Notre société</p>
              <p className="text-xs text-muted-foreground">Portail de dossiers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/submit">
              <Button className="rounded-full px-5">
                Accéder
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className="page-transition grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Simple, sécurisé, moderne
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Un portail plus clair pour vos dossiers.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Remplissez votre fiche, téléchargez vos documents et soumettez votre dossier en quelques minutes. Simple et sécurisé.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/submit">
                <Button size="lg" className="group rounded-full px-7">
                  Commencer maintenant
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              {/* <Link href="/admin">
                <Button variant="outline" size="lg" className="rounded-full px-7">
                  Espace admin
                </Button>
              </Link> */}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Intuitif', 'Une interface simple qui guide chaque étape, étape par étape.'],
                ['Responsive', 'Soumettez votre dossier depuis votre téléphone, tablette ou ordinateur.'],
                ['Accessible', 'Un design clair avec des contrastes optimisés le jour comme la nuit.'],
              ].map(([title, text]) => (
                <div key={title} className="glass-card p-4">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="hero-panel relative overflow-hidden p-6 md:p-8">
            <div className="soft-grid absolute inset-0 opacity-40" />
            <div className="relative space-y-6">
              <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Flux de travail</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['1. Informations', 'Vos coordonnées de base en un passage rapide.'],
                    ['2. Fiche complète', 'Remplissez la fiche de renseignement détaillée.'],
                    ['3. Documents', 'Téléchargez vos pièces justificatives en toute sécurité.'],
                    ['4. Validation', 'Vérifiez tout et envoyez votre dossier complet.'],
                  ].map(([step, text]) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 p-3">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {step.split('.')[0]}
                      </div>
                      <div>
                        <p className="font-medium">{step}</p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Protection</p>
                  <p className="mt-2 text-2xl font-bold">Vos données</p>
                  <p className="mt-2 text-sm text-muted-foreground">Vos informations sont protégées et stockées de manière sécurisée.</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Confort</p>
                  <p className="mt-2 text-2xl font-bold">Jour et nuit</p>
                  <p className="mt-2 text-sm text-muted-foreground">Basculez entre le mode clair et sombre selon votre préférence.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
