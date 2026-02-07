'use client';

import { Moon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { type ReactNode, useState, useCallback, useEffect } from 'react';

const STEPS = [
  { key: 'theme', label: 'INICIO', number: 1 },
  { key: 'question', label: 'DETALLES', number: 2 },
  { key: 'questions', label: 'PREGUNTAS', number: 3 },
  { key: 'rewards', label: 'RECOMPENSAS', number: 4 },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

// Progress percentages for each step
const PROGRESS: Record<string, number> = {
  theme: 0,
  question: 25,
  questions: 50,
  rewards: 90,
  finalize: 100,
};

interface NewQuestionnaireShellProps {
  children: ReactNode;
}

export default function NewQuestionnaireShell({ children }: NewQuestionnaireShellProps) {
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as StepKey) || 'theme';
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = PROGRESS[currentStep] ?? 0;

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Background vignette */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(200,210,230,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Top stepper nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        {/* Stepper */}
        <nav className="flex flex-1 items-center justify-center" aria-label="Pasos del cuestionario">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const isActive = step.key === currentStep;
              const isPast = i < currentIndex;

              return (
                <span key={step.key} className="flex items-center">
                  {/* Step indicator */}
                  <Link
                    href={`/dashboard/questionnaires/new?step=${step.key}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : isPast
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span
                      className={`hidden text-[11px] font-bold uppercase tracking-widest transition-colors sm:inline ${
                        isActive
                          ? 'text-gray-900'
                          : isPast
                            ? 'text-gray-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </Link>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <span
                      className={`mx-3 hidden h-px w-16 sm:block lg:w-24 ${
                        i < currentIndex ? 'bg-blue-300' : 'bg-gray-200'
                      }`}
                      style={{ borderTop: i < currentIndex ? undefined : '1px dashed #d1d5db' }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        </nav>

        {/* Theme toggle */}
        <button
          type="button"
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Cambiar tema"
        >
          <Moon className="h-5 w-5" />
        </button>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>

      {/* Bottom progress bar */}
      <footer className="relative z-10 px-6 pb-6 pt-4 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Estado del progreso
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {progress}% Completado
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </footer>

      {/* Toast */}
      <div
        className={`fixed bottom-16 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
          toastVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      </div>

      {/* Expose showToast via custom event */}
      <ToastBridge showToast={showToast} />
    </div>
  );
}

/** Listens for a custom event so child steps can trigger toasts */
function ToastBridge({ showToast }: { showToast: (msg: string) => void }) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      showToast(detail || 'Guardado');
    };
    window.addEventListener('formly:toast', handler);
    return () => window.removeEventListener('formly:toast', handler);
  }, [showToast]);

  return null;
}
