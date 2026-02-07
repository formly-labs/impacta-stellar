'use client';

import {
  Circle,
  Square,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle,
  GripVertical,
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
    router.push('/dashboard/questionnaires/new?step=finalize');
  }, [questions, router]);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Paso 03 — Editor de preguntas
          </p>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-tight">
            Diseña tu <span className="font-bold">pregunta</span>
          </h1>
        </div>

        {/* Question blocks */}
        <div className="space-y-6">
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

        {/* Bottom actions */}
        <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
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
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Finalizar encuesta
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
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

  // Preview-only state (not persisted)
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<number[]>([]);
  const [previewText, setPreviewText] = useState('');

  // Reset preview state when answer type changes
  const prevTypeRef = useRef(question.type);
  useEffect(() => {
    if (prevTypeRef.current !== question.type) {
      setSelectedRadio(null);
      setSelectedCheckboxes([]);
      setPreviewText('');
      prevTypeRef.current = question.type;
    }
  }, [question.type]);

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
    // Clean up preview selections that reference removed index
    if (selectedRadio === optIdx) setSelectedRadio(null);
    else if (selectedRadio !== null && selectedRadio > optIdx) setSelectedRadio(selectedRadio - 1);
    setSelectedCheckboxes((prev) =>
      prev.filter((i) => i !== optIdx).map((i) => (i > optIdx ? i - 1 : i)),
    );
  };

  const toggleAllowOther = () => {
    onUpdate({ allowOther: !question.allowOther });
  };

  const toggleCheckbox = (idx: number) => {
    setSelectedCheckboxes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const currentTypeLabel =
    ANSWER_TYPES.find((t) => t.value === question.type)?.label ?? question.type;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* ── Builder: question input + type selector ── */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
        {/* Drag handle + number */}
        <div className="flex items-center gap-2 sm:mr-1">
          <GripVertical className="h-4 w-4 text-gray-300" />
          <span className="text-xs font-bold text-gray-400">{index + 1}.</span>
        </div>

        {/* Question title input */}
        <div className="flex-1">
          <input
            ref={titleRef}
            type="text"
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Escribe tu pregunta aquí..."
            className={`w-full border-0 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none focus:ring-0 ${
              error ? 'text-red-600 placeholder-red-300' : ''
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Answer type dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <AnswerTypeIcon type={question.type} />
            <span className="hidden whitespace-nowrap sm:inline">{currentTypeLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {ANSWER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      onUpdate({ type: t.value });
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Eliminar pregunta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Options editor (radio / checkbox only) ── */}
      {showOptions && (
        <div className="space-y-1 border-b border-gray-100 p-5 pt-3">
          {question.options.map((opt, optIdx) => (
            <div key={optIdx} className="group flex items-center gap-3">
              <OptionIcon className="h-4 w-4 flex-shrink-0 text-gray-300" />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(optIdx, e.target.value)}
                placeholder={`Opción ${optIdx + 1}`}
                className="flex-1 border-0 border-b border-transparent bg-transparent py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-300"
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(optIdx)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Eliminar opción ${optIdx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}

          {/* "Otro" row */}
          {question.allowOther && (
            <div className="flex items-center gap-3">
              <OptionIcon className="h-4 w-4 flex-shrink-0 text-gray-300" />
              <span className="py-2 text-sm italic text-gray-400">Otro...</span>
            </div>
          )}

          {/* Add option + add "Otro" */}
          <div className="flex items-center gap-3 pt-2">
            <OptionIcon className="h-4 w-4 flex-shrink-0 text-gray-200" />
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-gray-400 transition-colors hover:text-blue-600"
            >
              Añadir opción
            </button>
            <button
              type="button"
              onClick={toggleAllowOther}
              className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                question.allowOther
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              O añadir &quot;otro&quot;
            </button>
          </div>

          {optionsError && (
            <p className="pt-1 text-xs text-red-500">{optionsError}</p>
          )}
        </div>
      )}

      {/* ── Preview area ── */}
      <div className="p-5 pt-3">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Vista previa
        </p>

        {/* Radio preview */}
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
                    name={`q-${question.id}`}
                    checked={selectedRadio === optIdx}
                    onChange={() => setSelectedRadio(optIdx)}
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
                  name={`q-${question.id}`}
                  checked={selectedRadio === question.options.length}
                  onChange={() => setSelectedRadio(question.options.length)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm italic text-gray-500">Otro...</span>
              </label>
            )}
          </fieldset>
        )}

        {/* Checkbox preview */}
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
                    checked={selectedCheckboxes.includes(optIdx)}
                    onChange={() => toggleCheckbox(optIdx)}
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
                  checked={selectedCheckboxes.includes(question.options.length)}
                  onChange={() => toggleCheckbox(question.options.length)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm italic text-gray-500">Otro...</span>
              </label>
            )}
          </fieldset>
        )}

        {/* Short text preview */}
        {question.type === 'short_text' && (
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Respuesta corta..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        )}

        {/* Long text preview */}
        {question.type === 'long_text' && (
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Respuesta larga..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>
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
