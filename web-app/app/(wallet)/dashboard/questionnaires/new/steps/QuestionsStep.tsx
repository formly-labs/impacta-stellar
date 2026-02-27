'use client';

import {
  Circle,
  Square,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle,
  GripVertical,
  Sparkles,
  ShieldCheck,
  X,
  ArrowUp,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
  createEmptyQuestion,
  type QuestionDraft,
  type AnswerType,
} from '@/lib/newQuestionnaireDraft';

const ANSWER_TYPES: { value: AnswerType; label: string }[] = [
  { value: 'radio', label: 'Botón de selección (Radio)' },
  { value: 'checkbox', label: 'Casillas (Checkbox)' },
  { value: 'short_text', label: 'Respuesta corta' },
  { value: 'long_text', label: 'Respuesta larga' },
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function QuestionsStep() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from draft on mount
  useEffect(() => {
    const draft = loadQuestionnaireDraft();
    if (draft.questions && draft.questions.length > 0) {
      setQuestions(draft.questions);
    } else {
      const first = createEmptyQuestion();
      setQuestions([first]);
      setFocusId(first.id);
    }
  }, []);

  // Debounced save
  const persistQuestions = useCallback((qs: QuestionDraft[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveQuestionnaireDraft({ questions: qs });
    }, 300);
  }, []);

  // Update helper
  const updateQuestion = useCallback(
    (id: string, patch: Partial<QuestionDraft>) => {
      setQuestions((prev) => {
        const next = prev.map((q) => (q.id === id ? { ...q, ...patch } : q));
        persistQuestions(next);
        return next;
      });
      // Clear errors for this question on any change
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        delete copy[`${id}:options`];
        return copy;
      });
    },
    [persistQuestions],
  );

  const addQuestion = useCallback(() => {
    const q = createEmptyQuestion();
    setQuestions((prev) => {
      const next = [...prev, q];
      persistQuestions(next);
      return next;
    });
    setFocusId(q.id);
  }, [persistQuestions]);

  const removeQuestion = useCallback(
    (id: string) => {
      setQuestions((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((q) => q.id !== id);
        persistQuestions(next);
        return next;
      });
    },
    [persistQuestions],
  );

  // Validate & finalize
  const handleFinalize = useCallback(() => {
    const newErrors: Record<string, string> = {};

    questions.forEach((q) => {
      if (!q.title.trim()) {
        newErrors[q.id] = 'La pregunta no puede estar vacía';
      }
      if (q.type === 'radio' || q.type === 'checkbox') {
        const filledOptions = q.options.filter((o) => o.trim().length > 0);
        if (filledOptions.length < 2) {
          newErrors[`${q.id}:options`] = 'Necesitas al menos 2 opciones con texto';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveQuestionnaireDraft({ questions });
    window.dispatchEvent(
      new CustomEvent('formly:toast', { detail: 'Guardado correctamente' }),
    );
    router.push('/dashboard/questionnaires/new?step=preview');
  }, [questions, router]);

  const [assistantOpen, setAssistantOpen] = useState(true);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:gap-6 lg:px-6">
      {/* Main: question editor in the middle, wider card + space between answers */}
      <div className="order-1 min-w-0 flex-1 lg:order-1">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="space-y-0.5">
            <p className="text-base font-bold uppercase tracking-widest text-blue-600">
              Paso 02 — Editor de preguntas
            </p>
            <h1 className="text-2xl font-light tracking-tight text-gray-900 sm:text-3xl sm:leading-tight">
              Diseña tus <span className="font-bold">preguntas</span>
            </h1>
          </div>

          <div className="space-y-4">
            {questions.map((question, idx) => (
            <QuestionBlock
              key={question.id}
              question={question}
              index={idx}
              total={questions.length}
              error={errors[question.id]}
              optionsError={errors[`${question.id}:options`]}
              autoFocus={focusId === question.id}
              onUpdate={(patch) => updateQuestion(question.id, patch)}
              onRemove={() => removeQuestion(question.id)}
            />
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 pt-1 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Siguiente pregunta
          </button>
          <button
            type="button"
            onClick={handleFinalize}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Visualiza y finaliza la encuesta
            <CheckCircle className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>

      {/* Chat: right side on desktop, taller panel */}
      <aside
        className={`order-2 flex flex-shrink-0 flex-col lg:w-[320px] lg:min-h-[calc(100vh-14rem)] ${
          assistantOpen ? 'flex' : 'hidden'
        }`}
      >
        <div className="sticky top-4 flex min-h-[260px] flex-1 flex-col rounded-xl border border-gray-200 bg-white shadow-md lg:min-h-[calc(100vh-14rem)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Asistente Anti-Sesgo</h2>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                  IA especializada
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar asistente"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Objective box */}
          <div className="mx-3 mt-3 flex gap-2.5 rounded-lg border border-primary-100 bg-gray-50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-xs text-gray-700">
              <span className="font-semibold text-gray-900">Objetivo:</span> Ayudarte a redactar encuestas neutrales y objetivas que mejoren la calidad de tus datos.
            </p>
          </div>

          {/* AI message */}
          <div className="flex-1 space-y-1.5 px-3 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Asistente
              </span>
            </div>
            <div className="rounded-xl bg-gray-100 px-4 py-3">
              <p className="text-sm text-gray-700">
                Escribe sobre qué realizarás tu encuesta. Te ayudaré a redactar preguntas claras y sin sesgos.
              </p>
            </div>
            <p className="text-[10px] text-gray-400">Justo ahora</p>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 px-3 py-2.5">
            <div className="flex gap-1.5">
              <textarea
                placeholder="Ej. Encuesta de clima laboral..."
                rows={1}
                className="min-h-[38px] flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                readOnly
                tabIndex={-1}
                aria-label="Mensaje para el asistente (mock)"
              />
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary-600"
                aria-label="Enviar (mock)"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 border-t border-gray-100 pt-1.5">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sugerir temas
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Historial
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle to show assistant again when closed */}
      {!assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-600 lg:bottom-8 lg:right-8"
          aria-label="Abrir asistente"
        >
          <Sparkles className="h-4 w-4" />
          Asistente
        </button>
      )}
    </div>
  );
}

// ─── Single question block ──────────────────────────────────────────────────────

interface QuestionBlockProps {
  question: QuestionDraft;
  index: number;
  total: number;
  error?: string;
  optionsError?: string;
  autoFocus: boolean;
  onUpdate: (patch: Partial<QuestionDraft>) => void;
  onRemove: () => void;
}

function QuestionBlock({
  question,
  index,
  total,
  error,
  optionsError,
  autoFocus,
  onUpdate,
  onRemove,
}: QuestionBlockProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auto-focus newest
  useEffect(() => {
    if (autoFocus && titleRef.current) {
      titleRef.current.focus();
    }
  }, [autoFocus]);

  const showOptions = question.type === 'radio' || question.type === 'checkbox';
  const OptionIcon = question.type === 'checkbox' ? Square : Circle;

  const updateOption = (optIdx: number, value: string) => {
    const newOpts = [...question.options];
    newOpts[optIdx] = value;
    onUpdate({ options: newOpts });
  };

  const addOption = () => {
    onUpdate({ options: [...question.options, ''] });
  };

  const removeOption = (optIdx: number) => {
    if (question.options.length <= 2) return;
    const newOpts = question.options.filter((_, i) => i !== optIdx);
    onUpdate({ options: newOpts });
  };

  const toggleAllowOther = () => {
    onUpdate({ allowOther: !question.allowOther });
  };

  const currentTypeLabel =
    ANSWER_TYPES.find((t) => t.value === question.type)?.label ?? question.type;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* ── Builder: question input + type selector ── */}
      <div className="flex flex-col gap-1.5 border-b border-gray-100 p-2.5 sm:flex-row sm:items-center sm:gap-2 sm:p-3">
        {/* Drag handle + number */}
        <div className="flex items-center gap-1.5 sm:mr-0">
          <GripVertical className="h-4 w-4 text-gray-300" />
          <span className="text-xs font-bold text-gray-400">{index + 1}.</span>
        </div>

        {/* Question title input */}
        <div className="min-w-0 flex-1">
          <input
            ref={titleRef}
            type="text"
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Escribe tu pregunta aquí..."
            className={`w-full border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-0 sm:text-base ${
              error ? 'text-red-600 placeholder-red-300' : ''
            }`}
          />
          {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
        </div>

        {/* Answer type dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <AnswerTypeIcon type={question.type} />
            <span className="hidden max-w-[120px] truncate whitespace-nowrap sm:inline">{currentTypeLabel}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {ANSWER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      onUpdate({ type: t.value });
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                      question.type === t.value
                        ? 'font-semibold text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    <AnswerTypeIcon type={t.value} />
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Remove (only if >1 question) */}
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Options editor (radio / checkbox only) ── */}
      {showOptions && (
        <div className="space-y-2 border-b border-gray-100 p-2.5 pt-1.5 sm:p-3 sm:pt-2">
          {question.options.map((opt, optIdx) => (
            <div key={optIdx} className="group flex items-center gap-2 py-1">
              <OptionIcon className="h-3 w-3 flex-shrink-0 text-gray-300" />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(optIdx, e.target.value)}
                placeholder={`Opción ${optIdx + 1}`}
                className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent py-1 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-300 sm:text-base"
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(optIdx)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Eliminar opción ${optIdx + 1}`}
                >
                  <Trash2 className="h-3 w-3 text-gray-300 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}

          {/* "Otro" row */}
          {question.allowOther && (
            <div className="flex items-center gap-2 py-1">
              <OptionIcon className="h-3 w-3 flex-shrink-0 text-gray-300" />
              <span className="text-xs italic text-gray-400">Otro...</span>
            </div>
          )}

          {/* Add option + add "Otro" */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0 pt-1">
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-blue-600"
            >
              <OptionIcon className="h-3 w-3 flex-shrink-0 text-gray-200" />
              Añadir opción
            </button>
            <button
              type="button"
              onClick={toggleAllowOther}
              className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                question.allowOther
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              O &quot;otro&quot;
            </button>
          </div>

          {optionsError && (
            <p className="pt-0.5 text-xs text-red-500">{optionsError}</p>
          )}
        </div>
      )}

    </div>
  );
}

// ─── Helper icon ────────────────────────────────────────────────────────────────

function AnswerTypeIcon({ type }: { type: AnswerType }) {
  switch (type) {
    case 'radio':
      return <Circle className="h-4 w-4 text-blue-500" />;
    case 'checkbox':
      return <Square className="h-4 w-4 text-blue-500" />;
    case 'short_text':
      return (
        <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-blue-500">
          Aa
        </span>
      );
    case 'long_text':
      return (
        <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-blue-500">
          ¶
        </span>
      );
    default:
      return null;
  }
}
