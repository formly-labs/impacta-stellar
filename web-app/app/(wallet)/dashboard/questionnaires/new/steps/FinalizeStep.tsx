'use client';

import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Coins,
  HelpCircle,
  Rocket,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  loadQuestionnaireDraft,
  clearQuestionnaireDraft,
  type QuestionnaireDraft,
} from '@/lib/newQuestionnaireDraft';

const THEME_LABELS: Record<string, string> = {
  'Product UX': 'Experiencia de producto',
  Segmentation: 'Segmentación',
  Sales: 'Ventas',
  Other: 'Otro',
};

const TYPE_LABELS: Record<string, string> = {
  radio: 'Selección única',
  checkbox: 'Selección múltiple',
  short_text: 'Respuesta corta',
  long_text: 'Respuesta larga',
};

export default function FinalizeStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuestionnaireDraft>({});
  const [published, setPublished] = useState(false);

  useEffect(() => {
    setDraft(loadQuestionnaireDraft());
  }, []);

  const questionsCount = draft.questions?.length ?? 0;
  const reward = draft.rewardPerGoodAnswer;
  const themeLabel = draft.theme ? (THEME_LABELS[draft.theme] ?? draft.theme) : '—';

  const handlePublish = () => {
    // For now: clear draft, show success, then redirect
    clearQuestionnaireDraft();
    setPublished(true);
  };

  if (published) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <Rocket className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            ¡Encuesta publicada!
          </h1>
          <p className="text-gray-500">
            Tu cuestionario ya está listo para recibir respuestas.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Paso 05 — Revisión final
          </p>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-tight">
            Revisa y <span className="font-bold">publica</span>
          </h1>
          <p className="text-gray-400">
            Confirma que todo esté correcto antes de publicar tu encuesta.
          </p>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Theme */}
          <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Tema
              </p>
              <p className="text-sm font-medium text-gray-900">{themeLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/questionnaires/new?step=theme')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
          </div>

          {/* Questions */}
          <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Preguntas
              </p>
              <p className="text-sm font-medium text-gray-900">
                {questionsCount} {questionsCount === 1 ? 'pregunta' : 'preguntas'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/questionnaires/new?step=questions')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
          </div>

          {/* Reward */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Recompensa por respuesta
              </p>
              <p className="text-sm font-medium text-gray-900">
                {reward != null ? `${reward} XLM` : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/questionnaires/new?step=rewards')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Questions detail */}
        {draft.questions && draft.questions.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Detalle de preguntas
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {draft.questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 px-6 py-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {q.title || <span className="italic text-gray-400">Sin título</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {TYPE_LABELS[q.type] ?? q.type}
                      {(q.type === 'radio' || q.type === 'checkbox') &&
                        ` · ${q.options.filter((o) => o.trim()).length} opciones`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/questionnaires/new?step=rewards')}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <CheckCircle className="h-4 w-4" />
            Publicar encuesta
          </button>
        </div>
      </div>
    </div>
  );
}
