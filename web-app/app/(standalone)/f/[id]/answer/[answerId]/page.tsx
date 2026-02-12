'use client';

import { Loader } from '@/components';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AnswerStatus {
  exists: boolean;
  submittedAt: number | null;
}

export default function AnswerResultPage() {
  const params = useParams<{ id: string; answerId: string }>();
  const formId = params.id;
  const answerId = params.answerId ?? '';
  
  const [ status, setStatus ] = useState<AnswerStatus | null>(null);
  const [ loading, setLoading ] = useState(true);
  
  useEffect(() => {
    if (!answerId) return;
    
    fetch(`/api/public/answers/${answerId}`)
      .then((res) => res.json())
      .then((data: AnswerStatus) => setStatus(data))
      .catch(() => setStatus({ exists: false, submittedAt: null }))
      .finally(() => setLoading(false));
  }, [ answerId ]);
  
  const formLink = `/f/${formId}`;
  
  if (loading) {
    return <div className="flex min-h-screen w-full items-center justify-center"><Loader /></div>;
  }
  
  const isCompleted = status?.exists ?? false;
  const submittedAt = status?.submittedAt
    ? new Date(status.submittedAt).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null;
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg space-y-8 text-center animate-fade-in">
        <div className="relative mx-auto aspect-square max-w-xs">
          <Image
            src={isCompleted ? '/assets/happy.png' : '/assets/sad.png'}
            alt={isCompleted ? 'Formulario completado - Formly' : 'Formulario no completado - Formly'}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 384px) 100vw, 384px"
          />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isCompleted ? 'Formulario completado' : 'Formulario no completado'}
          </h1>
          <p className="text-gray-500">
            {isCompleted
              ? 'Tu respuesta fue registrada correctamente.'
              : 'Este ID de respuesta no existe.'}
          </p>
          {isCompleted && submittedAt && (
            <p className="text-sm text-gray-400">
              Respondido el {submittedAt}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Link
            href={formLink}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90"
          >
            {isCompleted ? 'Volver al formulario' : 'Completar formulario'}
          </Link>
        </div>
      </div>
    </div>
  );
}
