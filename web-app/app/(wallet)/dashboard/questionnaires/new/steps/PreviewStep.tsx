'use client';

import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Square,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  loadQuestionnaireDraft,
  type QuestionnaireDraft,
  type QuestionDraft,
} from '@/lib/newQuestionnaireDraft';

const TYPE_LABELS: Record<string, string> = {
  radio: 'Selección única',
  checkbox: 'Selección múltiple',
  short_text: 'Respuesta corta',
  long_text: 'Respuesta larga',
};

export default function PreviewStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuestionnaireDraft>({});

  useEffect(() => {
    setDraft(loadQuestionnaireDraft());
  }, []);

  const questions = draft.questions ?? [];
  const title = draft.firstQuestion || 'Sin título';

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-lg font-bold uppercase tracking-widest text-blue-600">
            Vista previa de la encuesta
          </p>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-tight">
            Así se verá tu <span className="font-bold">encuesta</span>
          </h1>
          <p className="text-gray-400">
            Revisa cada pregunta antes de continuar.
          </p>
        </div>

        {/* Survey preview card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Survey title bar */}
          <div className="border-b border-gray-100 px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Título de la encuesta
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{title}</h2>
          </div>

          {/* Questions */}
          <div className="divide-y divide-gray-50">
            {questions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                No hay preguntas definidas.
              </div>
            ) : (
              questions.map((q, i) => (
                <QuestionPreview key={q.id} question={q} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/questionnaires/new?step=questions')}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al editor
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/questionnaires/new?step=rewards')}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <CheckCircle className="h-4 w-4" />
            Finalizar encuesta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Single question preview ── */

function QuestionPreview({ question, index }: { question: QuestionDraft; index: number }) {
  const showOptions = question.type === 'radio' || question.type === 'checkbox';
  const OptionIcon = question.type === 'checkbox' ? Square : Circle;

  return (
    <div className="px-6 py-5">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {question.title || <span className="italic text-gray-400">Sin título</span>}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {TYPE_LABELS[question.type] ?? question.type}
          </p>
        </div>
      </div>

      {/* Interactive preview */}
      <div className="mt-4 ml-10">
        {/* Radio */}
        {question.type === 'radio' && (
          <fieldset className="space-y-2">
            {question.options.map((opt, optIdx) => {
              const label = opt.trim() || `Opción ${optIdx + 1}`;
              return (
                <label
                  key={optIdx}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              );
            })}
            {question.allowOther && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name={`preview-${question.id}`}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm italic text-gray-500">Otro...</span>
              </label>
            )}
          </fieldset>
        )}

        {/* Checkbox */}
        {question.type === 'checkbox' && (
          <fieldset className="space-y-2">
            {question.options.map((opt, optIdx) => {
              const label = opt.trim() || `Opción ${optIdx + 1}`;
              return (
                <label
                  key={optIdx}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              );
            })}
            {question.allowOther && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm italic text-gray-500">Otro...</span>
              </label>
            )}
          </fieldset>
        )}

        {/* Short text */}
        {question.type === 'short_text' && (
          <input
            type="text"
            placeholder="Respuesta corta..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        )}

        {/* Long text */}
        {question.type === 'long_text' && (
          <textarea
            placeholder="Respuesta larga..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>
    </div>
  );
}
