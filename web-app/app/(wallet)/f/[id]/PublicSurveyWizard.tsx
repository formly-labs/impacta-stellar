'use client';

import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';
import QuestionRenderer, { type PublicField } from './QuestionRenderer';

interface SurveyData {
  id: string;
  title: string;
  description?: string | null;
  fields: PublicField[];
}

interface PublicSurveyWizardProps {
  survey: SurveyData;
}

export default function PublicSurveyWizard({ survey }: PublicSurveyWizardProps) {
  const { fields } = survey;
  const total = fields.length;
  const { account } = useWallet();
  
  const [ step, setStep ] = useState(0);
  const [ answers, setAnswers ] = useState<Record<string, string | string[]>>({});
  const [ error, setError ] = useState<string | null>(null);
  const [ submitting, setSubmitting ] = useState(false);
  const [ submitted, setSubmitted ] = useState(false);
  
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
        body: JSON.stringify({ answers, walletAddress: account?.address || '' }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Error al enviar la respuesta');
      }
      
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar la respuesta',
      );
    } finally {
      setSubmitting(false);
    }
  }, [ validateCurrent, survey.id, answers ]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      
      if (e.key === 'Enter' && !isTyping) {
        e.preventDefault();
        if (isLast) {
          handleSubmit();
        } else {
          handleNext();
        }
      }
      
      // Keyboard shortcut for radio options (A, B, C...)
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
  
  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg space-y-8 text-center animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              ¡Gracias por responder!
            </h1>
            <p className="text-gray-500">
              Tu respuesta fue registrada correctamente.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-fade-in" key={step}>
          {/* Step indicator */}
          <div className="mb-8">
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
      
      <footer className="border-t border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-gray-400">
              Pregunta {step + 1} de {total}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-500">{progress}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}
            
            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando…
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
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
