'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IntroStep() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <span className="text-3xl">👋</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Bienvenido a Formly
        </h1>
        <p className="text-gray-500 text-lg">
          Nos alegra tenerte aquí. Configuremos tu cuenta en unos pocos pasos.
        </p>
        <button
          onClick={() => router.push('/dashboard/onboarding?step=details')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Comenzar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
