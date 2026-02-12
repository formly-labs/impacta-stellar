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

  return (
    <div className="space-y-6">
      {/* Question label */}
      <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
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
          className={`w-full rounded-xl border bg-white px-5 py-4 text-base text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      ) : type === 'long_text' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Escribe tu respuesta aquí...'}
          rows={4}
          className={`w-full resize-none rounded-xl border bg-white px-5 py-4 text-base text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      ) : type === 'radio' ? (
        <div className="space-y-3">
          {options.map((option, idx) => {
            const isSelected = value === option;
            const letter = String.fromCharCode(65 + idx); // A, B, C...
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(option)}
                className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}
                >
                  {letter}
                </span>
                <span className="flex-1 text-base text-gray-800">{option}</span>
                {isSelected && (
                  <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      ) : type === 'checkbox' ? (
        <div className="space-y-3">
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
                className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    isChecked
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}
                >
                  {isChecked ? <Check className="h-4 w-4" /> : letter}
                </span>
                <span className="flex-1 text-base text-gray-800">{option}</span>
                {isChecked && (
                  <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
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
          className={`w-full rounded-xl border bg-white px-5 py-4 text-base text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      ) : (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Escribe tu respuesta aquí...'}
          className={`w-full rounded-xl border bg-white px-5 py-4 text-base text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      )}

      {/* Keyboard hint for radio/checkbox */}
      {type === 'radio' && options.length > 0 && (
        <p className="text-sm text-gray-400">
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
