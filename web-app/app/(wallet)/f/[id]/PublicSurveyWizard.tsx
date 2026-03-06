'use client';

import { Loader } from '@/components/Loader';
import { usePollar } from '@pollar/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Copy, Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import QuestionRenderer, { type PublicField } from './QuestionRenderer';

interface SurveyData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  fields: PublicField[];
  welcomeTitle?: string | null;
  welcomeDescription?: string | null;
  endingTitle?: string | null;
  endingDescription?: string | null;
}

interface PublicSurveyWizardProps {
  survey: SurveyData;
}

export default function PublicSurveyWizard({ survey }: PublicSurveyWizardProps) {
  const { fields } = survey;
  const total = fields.length;
  const { walletAddress } = usePollar();

  const [ step, setStep ] = useState(0);
  const [ answers, setAnswers ] = useState<Record<string, string | string[]>>({});
  const [ error, setError ] = useState<string | null>(null);
  const [ submitting, setSubmitting ] = useState(false);
  const [ submittedId, setSubmittedId ] = useState('');
  const [ copiedAnswer, setCopiedAnswer ] = useState(false);
  const [ checkingPrevious, setCheckingPrevious ] = useState(true);
  const [ started, setStarted ] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setCheckingPrevious(false);
      return;
    }
    setCheckingPrevious(true);
    fetch(`/api/public/surveys/${survey.id}/responses?wallet=${walletAddress}`)
      .then((res) => res.json())
      .then((data: { id: string | null }) => {
        if (data.id) setSubmittedId(data.id);
      })
      .catch(() => {
      })
      .finally(() => setCheckingPrevious(false));
  }, [ survey.id, walletAddress ]);

  const currentField = fields[step];
  const isFirst = step === 0;
  const isLast = step === total - 1;
  const progress = Math.round(((step + 1) / total) * 100);

  // Validate current question
  const validateCurrent = useCallback((): boolean => {
    if (!currentField) return true;

    if (currentField.required) {
      const val = answers[currentField.id];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        setError('Esta pregunta es obligatoria');
        return false;
      }
    }

    setError(null);
    return true;
  }, [ currentField, answers ]);

  // Handle next
  const handleNext = useCallback(() => {
    if (!validateCurrent()) return;
    if (!isLast) {
      setStep((s) => s + 1);
      setError(null);
    }
  }, [ validateCurrent, isLast ]);

  // Handle back
  const handleBack = useCallback(() => {
    if (!isFirst) {
      setStep((s) => s - 1);
      setError(null);
    }
  }, [ isFirst ]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateCurrent()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/surveys/${survey.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, walletAddress }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Error al enviar la respuesta');
      }
      const data = await res.json();

      setSubmittedId(data.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar la respuesta',
      );
    } finally {
      setSubmitting(false);
    }
  }, [ validateCurrent, survey.id, answers ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'Enter' && !isTyping && survey.welcomeTitle && !started) {
        e.preventDefault();
        setStarted(true);
        return;
      }

      if (e.key === 'Enter' && !isTyping) {
        e.preventDefault();
        if (isLast) {
          handleSubmit();
        } else {
          handleNext();
        }
      }

      if (
        currentField?.type === 'radio' &&
        !isTyping &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        const idx = e.key.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < currentField.options.length) {
          setAnswers((prev) => ({
            ...prev,
            [currentField.id]: currentField.options[idx],
          }));
          setError(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ handleNext, handleSubmit, isLast, currentField ]);

  const handleCopyAnswerLink = async () => {
    const link = `${window.location.origin}/f/${survey.slug}/answer/${submittedId}`;
    await navigator.clipboard.writeText(link);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  if (checkingPrevious) {
    return <Loader />;
  }

  if (submittedId) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 sm:min-h-0 sm:h-full">
        <div className="w-full max-w-lg space-y-8 text-center animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {survey.endingTitle || '¡Gracias por responder!'}
            </h1>
            {(survey.endingDescription || !survey.endingTitle) && (
              <p className="text-gray-500">
                {survey.endingDescription || 'Tu respuesta fue registrada correctamente.'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopyAnswerLink}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            {copiedAnswer ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Link copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar link de respuesta
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (survey.welcomeTitle && !started) {
    return (
      <div className="flex min-h-[100dvh] flex-col overflow-hidden sm:min-h-0 sm:h-full">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 max-w-2xl w-full mx-auto animate-fade-in sm:px-6 sm:py-12">
          <h1 className="text-2xl font-normal italic text-gray-900 mb-4 sm:text-3xl">
            {survey.welcomeTitle}
          </h1>
          {survey.welcomeDescription && (
            <p className="text-sm text-gray-500 mb-8 sm:text-base sm:mb-12">
              {survey.welcomeDescription}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90"
            >
              Start
            </button>
            <span className="hidden text-sm text-gray-400 sm:inline">
              presiona <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">ENTER</kbd>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-2xl animate-fade-in" key={step}>
          {/* Step indicator */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-500">
              Pregunta {step + 1}{' '}
              <span className="text-gray-300">&gt;</span>
            </p>
          </div>

          <QuestionRenderer
            question={currentField}
            value={answers[currentField.id] ?? (currentField.type === 'checkbox' ? [] : '')}
            onChange={(val) => {
              setAnswers((prev) => ({ ...prev, [currentField.id]: val }));
              setError(null);
            }}
            error={error ?? undefined}
          />
        </div>
      </div>

      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-gray-400">
              {step + 1} / {total}
            </p>
            <div className="flex flex-1 items-center gap-2 sm:flex-none">
              <div className="h-1.5 w-full max-w-[6rem] overflow-hidden rounded-full bg-gray-100 sm:w-24">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-500">{progress}%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Atrás</span>
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Enviando…</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-6"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="hidden text-xs text-gray-400 sm:inline">
                  presiona{' '}
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                    ENTER
                  </kbd>
                </span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
