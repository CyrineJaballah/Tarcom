'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { getPendingSubmissions, removePendingSubmission } from '@/lib/db';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { getApiBaseUrl } from '@/lib/api-url';

export default function SubmissionStatusToast() {
  const [pendingCount, setPendingCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [lastStatus, setLastStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const checkQueue = async () => {
    const queue = await getPendingSubmissions();
    setPendingCount(queue.length);

    if (queue.length > 0 && !processing) {
      processQueue(queue);
    }
  };

  const processQueue = async (queue: any[]) => {
    setProcessing(true);
    const API_BASE_URL = getApiBaseUrl();

    for (const sub of queue) {
      try {
        const formData = new FormData();
        formData.append('firstName', sub.firstName);
        formData.append('lastName', sub.lastName);
        formData.append('email', sub.email);
        formData.append('phone', sub.phone);
        
        if (sub.fiche) {
          formData.append('fiche', sub.fiche);
        }

        Object.entries(sub.documents || {}).forEach(([key, file]: any) => {
          formData.append(`documents[${key}]`, file);
        });

        const res = await fetchWithRetry(`${API_BASE_URL}/submissions`, {
          method: 'POST',
          body: formData
        }, 12, 10000); // More retries for background processing

        if (res.ok) {
          await removePendingSubmission(sub.id);
          setLastStatus('success');
          setTimeout(() => setLastStatus('idle'), 5000);
        } else {
          setLastStatus('error');
        }
      } catch (e) {
        console.error('Queue processing error', e);
        setLastStatus('error');
      }
    }
    
    const remaining = await getPendingSubmissions();
    setPendingCount(remaining.length);
    setProcessing(false);
  };

  useEffect(() => {
    const interval = setInterval(checkQueue, 5000);
    checkQueue();
    return () => clearInterval(interval);
  }, [processing]);

  if (pendingCount === 0 && lastStatus === 'idle') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10">
      <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${
        lastStatus === 'success' ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100' :
        lastStatus === 'error' ? 'border-red-200 bg-red-50/90 text-red-900 dark:bg-red-900/20 dark:text-red-100' :
        'border-primary/20 bg-background/90 text-foreground'
      }`}>
        {processing ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : lastStatus === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : lastStatus === 'error' ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock3 className="h-5 w-5 text-amber-500" />
        )}
        
        <div className="flex-1">
          <p className="text-sm font-bold">
            {processing ? 'Envoi en cours...' : 
             lastStatus === 'success' ? 'Dossier envoyé !' :
             lastStatus === 'error' ? 'Échec de synchronisation' :
             'Dossier en attente'}
          </p>
          <p className="text-xs opacity-70">
            {pendingCount > 0 ? `${pendingCount} dossier(s) en file d'attente` : 'Tout est à jour'}
          </p>
        </div>
      </div>
    </div>
  );
}
