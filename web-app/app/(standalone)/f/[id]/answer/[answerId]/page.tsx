'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Mock: simula la respuesta del estado de una respuesta.
 * En el futuro se reemplazará por una request real a la API.
 */
function mockGetAnswerStatus(answerId: string): boolean {
  // Mock: si answerId existe y tiene longitud razonable = completado
  return !!answerId && answerId.length >= 10;
}

export default function AnswerResultPage() {
  const params = useParams<{ id: string; answerId: string }>();
  const formId = params.id;
  const answerId = params.answerId ?? '';

  const isCompleted = useMemo(() => mockGetAnswerStatus(answerId), [answerId]);
  const formLink = `/`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg space-y-8 text-center animate-fade-in">
        <div className="relative mx-auto aspect-square max-w-xs">
          <Image
            src={isCompleted ? '/assets/happy.png' : '/assets/sad.png'}
            alt={
              isCompleted
                ? 'Formulario completado - Formly'
                : 'Formulario no completado - Formly'
            }
            fill
            className="object-contain"
            priority
            sizes="(max-width: 384px) 100vw, 384px"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isCompleted
              ? 'Formulario completado'
              : 'Formulario no completado'}
          </h1>
          <p className="text-gray-500">
            {isCompleted
              ? 'Tu respuesta fue registrada correctamente.'
              : 'Aún no has completado el formulario.'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            href={formLink}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90"
          >
            Volver
          </Link>
          {!isCompleted && (
            <p className="text-sm text-gray-500">
              Completa el formulario:{' '}
              <Link
                href={formLink}
                className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Llenar formulario
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
