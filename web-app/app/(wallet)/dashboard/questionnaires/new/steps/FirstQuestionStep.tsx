'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import {
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
} from '@/lib/newQuestionnaireDraft';

const questionSchema = z.object({
  firstQuestion: z.string().min(1, 'Escribe tu primera pregunta'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export default function FirstQuestionStep() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { firstQuestion: '' },
  });

  // Load draft
  useEffect(() => {
    const draft = loadQuestionnaireDraft();
    if (draft.firstQuestion) {
      reset({ firstQuestion: draft.firstQuestion });
    }
  }, [reset]);

  const onSubmit = useCallback(
    (data: QuestionFormData) => {
      saveQuestionnaireDraft({ firstQuestion: data.firstQuestion });
      // Show toast via custom event
      window.dispatchEvent(
        new CustomEvent('formly:toast', { detail: 'Guardado. Próximo paso disponible pronto' }),
      );
      // Navigate to full question editor
      router.push('/dashboard/questionnaires/new?step=questions');
    },
    [router],
  );

  // Enter key submits (when not composing)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    },
    [handleSubmit, onSubmit],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Step label */}
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Paso 02</p>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.5rem] sm:leading-tight">
            Escribe tu primera{' '}
            <span className="font-bold">pregunta</span>
          </h1>
          <p className="text-gray-400">
            Esta será la primera pregunta de tu cuestionario.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-2">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <MessageSquare className="h-5 w-5 text-gray-300" />
              </div>
              <input
                {...register('firstQuestion')}
                type="text"
                placeholder="Escribe tu pregunta…"
                onKeyDown={handleKeyDown}
                className={`h-[56px] w-full rounded-2xl border bg-white py-4 pl-12 pr-14 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  errors.firstQuestion ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-500">
                  *
                </span>
              </div>
            </div>
            {errors.firstQuestion && (
              <p className="pl-1 text-xs text-red-500">{errors.firstQuestion.message}</p>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Siguiente pregunta
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400">
              pulsa{' '}
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                ENTER ↵
              </kbd>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
