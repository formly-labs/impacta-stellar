'use client';

import { ChevronRight, Moon, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { saveDraft, loadDraft } from '@/lib/onboardingStorage';
import { useCallback, useState, type ReactNode } from 'react';

const STEPS = [
  { key: 'intro', label: 'Inicio' },
  { key: 'details', label: 'Datos' },
  { key: 'submit', label: 'Enviar' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

interface OnboardingShellProps {
  children: ReactNode;
}

export default function OnboardingShell({ children }: OnboardingShellProps) {
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as StepKey) || 'intro';
  const [toastVisible, setToastVisible] = useState(false);

  const handleSaveDraft = useCallback(() => {
    // Trigger a custom event so the active step can flush its form values
    const event = new CustomEvent('formly:save-draft');
    window.dispatchEvent(event);

    // Brief delay to let the step handler save
    setTimeout(() => {
      const draft = loadDraft();
      saveDraft(draft);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }, 50);
  }, []);

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Subtle background vignette */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(200,210,230,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Top Nav */}
      <header className="relative z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-sm font-bold text-blue-600">OF</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Formly</span>
        </Link>

        {/* Stepper */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Pasos de registro">
          {STEPS.map((step, i) => (
            <span key={step.key} className="flex items-center gap-1">
              <Link
                href={`/dashboard/onboarding?step=${step.key}`}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  step.key === currentStep
                    ? 'text-blue-600'
                    : i < currentIndex
                      ? 'text-gray-700'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </Link>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              )}
            </span>
          ))}
        </nav>

        {/* Right side: theme toggle + save draft */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cambiar tema"
          >
            <Moon className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Save className="h-3.5 w-3.5" />
            Guardar borrador
          </button>
        </div>
      </header>

      {/* Mobile stepper */}
      <div className="relative z-10 flex items-center justify-center gap-1 border-b border-gray-100 bg-white/60 px-4 py-2 backdrop-blur-sm sm:hidden">
        {STEPS.map((step, i) => (
          <span key={step.key} className="flex items-center gap-1">
            <Link
              href={`/dashboard/onboarding?step=${step.key}`}
              className={`text-xs font-medium ${
                step.key === currentStep
                  ? 'text-blue-600'
                  : i < currentIndex
                    ? 'text-gray-700'
                    : 'text-gray-400'
              }`}
            >
              {step.label}
            </Link>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-gray-300" />
            )}
          </span>
        ))}
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
          toastVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          <Save className="h-3.5 w-3.5" />
          Borrador guardado
        </div>
      </div>
    </div>
  );
}
