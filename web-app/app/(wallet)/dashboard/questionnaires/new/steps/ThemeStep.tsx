'use client';

import { ArrowRight, BarChart3, Users, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
  type QuestionnaireTheme,
} from '@/lib/newQuestionnaireDraft';

const THEMES: { value: QuestionnaireTheme; label: string; icon: typeof BarChart3 }[] = [
  { value: 'Product UX', label: 'Experiencia de producto', icon: BarChart3 },
  { value: 'Segmentation', label: 'Segmentación', icon: Users },
  { value: 'Sales', label: 'Ventas', icon: ShoppingCart },
];

export default function ThemeStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<QuestionnaireTheme | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadQuestionnaireDraft();
    if (draft.theme) setSelected(draft.theme);
  }, []);

  const handleNext = useCallback(() => {
    if (!selected) return;
    saveQuestionnaireDraft({ theme: selected, firstQuestion: '' });
    router.push('/dashboard/questionnaires/new?step=question');
  }, [selected, router]);

  // Enter key advances
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl space-y-10 text-center">
        {/* Step label */}
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Paso 01</p>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.5rem] sm:leading-tight">
            ¿Cuál es el tema de tu{' '}
            <span className="font-bold">cuestionario?</span>
          </h1>
          <p className="text-gray-400">Elige uno para personalizar tu cuestionario.</p>
        </div>

        {/* Theme tiles */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={`group flex w-full items-center gap-3 rounded-2xl border-2 px-6 py-4 text-left transition-all sm:w-auto sm:min-w-[180px] ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleNext}
            disabled={!selected}
            className={`inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            Siguiente pregunta
            <ArrowRight className="h-4 w-4" />
          </button>
          {selected && (
            <span className="text-xs text-gray-400">
              pulsa{' '}
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                ENTER ↵
              </kbd>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
