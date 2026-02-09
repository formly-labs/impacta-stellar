'use client';

import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';
import { loadDraft, markOnboardingCompleted, clearDraft } from '@/lib/onboardingStorage';

export default function SubmitStep() {
  const router = useRouter();
  const { account } = useWallet();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!account?.address) {
      setError('Wallet no conectada. Vuelve a conectar tu wallet.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const draft = loadDraft();

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          firstName: draft.firstName,
          lastName: draft.lastName,
          email: draft.email,
          phone: draft.phone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Error del servidor');
      }

      markOnboardingCompleted();
      clearDraft();
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al guardar tu perfil. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          ¡Todo listo!
        </h1>
        <p className="text-lg text-gray-500">
          Revisa tu información y completa el proceso de registro.
        </p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            disabled={submitting}
            onClick={() => router.push('/dashboard/onboarding?step=details')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <button
            onClick={handleComplete}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Completar registro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
