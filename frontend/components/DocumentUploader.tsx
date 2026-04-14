'use client';

import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  file: File;
  uploadProgress: number;
}

interface DocumentUploaderProps {
  docType: string;
  required: boolean;
  onUpload: (file: File) => void;
  document?: UploadedDocument;
  onRemove: () => void;
}

export default function DocumentUploader({
  docType,
  required,
  onUpload,
  document,
  onRemove,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format non autorisé. Utilisez PDF, JPG, PNG ou DOCX.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Le fichier dépasse la limite de 10 Mo.';
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onUpload(file);
  };

  return (
    <Card
      className={`overflow-hidden border-border/70 transition-all duration-300 ${
        isDragging ? 'ring-2 ring-primary/40 shadow-lg shadow-primary/10' : ''
      }`}
    >
      {!document ? (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer p-4 transition-all md:p-5 ${
            isDragging
              ? 'bg-primary/5'
              : 'bg-linear-to-br from-background to-muted/30 hover:bg-muted/40'
          }`}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{docType}</p>
                {required && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Obligatoire
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Glissez-déposez le fichier ici ou cliquez pour choisir un document.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                PDF, JPG, PNG, WEBP ou DOCX jusqu’à 10 Mo
              </p>
            </div>

            <Button variant="outline" size="sm" className="rounded-full" type="button">
              Choisir un fichier
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 p-4 dark:bg-emerald-950/20 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  {document.name}
                </p>
                <p className="text-xs text-emerald-800/70 dark:text-emerald-200/70">
                  Fichier prêt pour l’envoi
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="rounded-full text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            >
              <X className="mr-1 h-4 w-4" />
              Retirer
            </Button>
          </div>

          <div className="mt-4">
            <Progress value={100} className="h-2" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border-t border-red-200/80 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </Card>
  );
}
