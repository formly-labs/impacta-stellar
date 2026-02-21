'use client';

import { Check } from 'lucide-react';

export interface PublicField {
  id: string;
  type: string;
  label: string;
  placeholder?: string | null;
  required: boolean;
  options: string[];
}

interface QuestionRendererProps {
  question: PublicField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const { type, label, placeholder, options } = question;

  const inputClasses = `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:px-5 sm:py-4 sm:text-base ${
    error ? 'border-red-300' : 'border-gray-200'
  }`;

  const optionClasses = (active: boolean) =>
    `group flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all sm:gap-4 sm:px-5 sm:py-4 ${
      active
        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
    }`;

  const badgeClasses = (active: boolean) =>
    `flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
      active
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
    }`;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Question label */}
      <h2 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl md:text-3xl">
        {label}
        {question.required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </h2>

      {/* Render by type */}
      {type === 'short_text' || type === 'text' || type === 'email' || type === 'phone' ? (
        <input
          type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Escribe tu respuesta aquí...'}
          className={inputClasses}
        />
      ) : type === 'long_text' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Escribe tu respuesta aquí...'}
          rows={4}
          className={`resize-none ${inputClasses}`}
        />
      ) : type === 'radio' ? (
        <div className="space-y-2 sm:space-y-3">
          {options.map((option, idx) => {
            const isSelected = value === option;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(option)}
                className={optionClasses(isSelected)}
              >
                <span className={badgeClasses(isSelected)}>
                  {letter}
                </span>
                <span className="flex-1 text-sm text-gray-800 sm:text-base">{option}</span>
                {isSelected && (
                  <Check className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                )}
              </button>
            );
          })}
        </div>
      ) : type === 'checkbox' ? (
        <div className="space-y-2 sm:space-y-3">
          {options.map((option, idx) => {
            const selectedArr = Array.isArray(value) ? value : [];
            const isChecked = selectedArr.includes(option);
            const letter = String.fromCharCode(65 + idx);

            const toggleOption = () => {
              if (isChecked) {
                onChange(selectedArr.filter((v) => v !== option));
              } else {
                onChange([...selectedArr, option]);
              }
            };

            return (
              <button
                key={idx}
                type="button"
                onClick={toggleOption}
                className={optionClasses(isChecked)}
              >
                <span className={badgeClasses(isChecked)}>
                  {isChecked ? <Check className="h-4 w-4" /> : letter}
                </span>
                <span className="flex-1 text-sm text-gray-800 sm:text-base">{option}</span>
                {isChecked && (
                  <Check className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                )}
              </button>
            );
          })}
          <p className="text-xs text-gray-400">Puedes seleccionar varias opciones</p>
        </div>
      ) : type === 'number' ? (
        <input
          type="number"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '0'}
          className={inputClasses}
        />
      ) : (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Escribe tu respuesta aquí...'}
          className={inputClasses}
        />
      )}

      {/* Keyboard hint for radio — desktop only */}
      {type === 'radio' && options.length > 0 && (
        <p className="hidden text-sm text-gray-400 sm:block">
          Presiona {options.map((_, i) => String.fromCharCode(65 + i)).join(', ')} para elegir una opción
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
