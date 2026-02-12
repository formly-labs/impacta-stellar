'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirige /f/[id]/answer?answerId=xxx → /f/[id]/answer/[answerId]
 * para mantener compatibilidad con links antiguos.
 */
export default function AnswerRedirectPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = params.id;
  const answerId = searchParams.get('answerId') ?? '';

  useEffect(() => {
    if (answerId) {
      router.replace(`/f/${formId}/answer/${answerId}`);
    } else {
      router.replace(`/f/${formId}`);
    }
  }, [formId, answerId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
    </div>
  );
}
