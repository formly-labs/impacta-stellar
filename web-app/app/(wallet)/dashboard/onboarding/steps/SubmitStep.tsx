'use client';

import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { markOnboardingCompleted, clearDraft } from '@/lib/onboardingStorage';

export default function SubmitStep() {
  const router = useRouter();

  const handleComplete = () => {
    markOnboardingCompleted();
    clearDraft();
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          ¡Todo listo!
        </h1>
        <p className="text-gray-500 text-lg">
          Revisa tu información y completa el proceso de registro.
        </p>
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => router.push('/dashboard/onboarding?step=details')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <button
            onClick={handleComplete}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <CheckCircle className="h-4 w-4" />
            Completar registro
          </button>
        </div>
      </div>
    </div>
  );
}
