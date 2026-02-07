'use client';

import { ArrowLeft, ArrowRight, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
  type RewardPreset,
} from '@/lib/newQuestionnaireDraft';

const PRESETS: { value: RewardPreset; label: string; amount: number | null }[] = [
  { value: '5', label: '5 XLM', amount: 5 },
  { value: '10', label: '10 XLM', amount: 10 },
  { value: '15', label: '15 XLM', amount: 15 },
  { value: 'custom', label: 'Otro', amount: null },
];

const MIN_REWARD = 0.1;
const MAX_REWARD = 1000;

export default function RewardsStep() {
  const router = useRouter();
  const [preset, setPreset] = useState<RewardPreset | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from draft
  useEffect(() => {
    const draft = loadQuestionnaireDraft();
    if (draft.rewardPreset) {
      setPreset(draft.rewardPreset);
      if (draft.rewardPreset === 'custom' && draft.rewardPerGoodAnswer != null) {
        setCustomValue(String(draft.rewardPerGoodAnswer));
      }
    }
  }, []);

  // Debounced save
  const persist = useCallback((p: RewardPreset, amount: number | undefined) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveQuestionnaireDraft({
        rewardPreset: p,
        rewardPerGoodAnswer: amount,
      });
    }, 300);
  }, []);

  const selectPreset = useCallback(
    (p: RewardPreset) => {
      setPreset(p);
      setError('');
      if (p !== 'custom') {
        const amount = Number(p);
        setCustomValue('');
        persist(p, amount);
      } else {
        // Keep existing custom value if any
        const num = parseFloat(customValue);
        persist(p, isNaN(num) ? undefined : num);
      }
    },
    [customValue, persist],
  );

  const handleCustomChange = useCallback(
    (raw: string) => {
      // Allow digits, a single dot, and up to 2 decimals
      if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) return;
      setCustomValue(raw);
      setError('');
      const num = parseFloat(raw);
      persist('custom', isNaN(num) ? undefined : num);
    },
    [persist],
  );

  const validate = useCallback((): boolean => {
    if (!preset) {
      setError('Selecciona una recompensa');
      return false;
    }
    if (preset === 'custom') {
      const num = parseFloat(customValue);
      if (isNaN(num) || customValue.trim() === '') {
        setError('Ingresa un monto válido');
        return false;
      }
      if (num < MIN_REWARD) {
        setError(`El monto mínimo es ${MIN_REWARD} XLM`);
        return false;
      }
      if (num > MAX_REWARD) {
        setError(`El monto máximo es ${MAX_REWARD} XLM`);
        return false;
      }
    }
    return true;
  }, [preset, customValue]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;

    const amount =
      preset === 'custom' ? parseFloat(customValue) : Number(preset);

    saveQuestionnaireDraft({
      rewardPreset: preset!,
      rewardPerGoodAnswer: amount,
    });

    window.dispatchEvent(
      new CustomEvent('formly:toast', { detail: 'Recompensa guardada' }),
    );
    router.push('/dashboard/questionnaires/new?step=finalize');
  }, [validate, preset, customValue, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Paso 04 — Ajustar recompensas
          </p>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-tight">
            Ajustar <span className="font-bold">recompensas</span>
          </h1>
          <p className="text-gray-400">
            Elige cuánto pagarás por cada buena respuesta.
          </p>
        </div>

        {/* Reward card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Icon */}
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
            <Coins className="h-6 w-6 text-yellow-500" />
          </div>

          {/* Preset pills */}
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((p) => {
              const isSelected = preset === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => selectPreset(p.value)}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom input */}
          {preset === 'custom' && (
            <div className="mt-5 space-y-1.5">
              <label
                htmlFor="custom-reward"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Monto (XLM)
              </label>
              <input
                id="custom-reward"
                type="text"
                inputMode="decimal"
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Ej: 7"
                className={`h-12 w-full max-w-[200px] rounded-xl border bg-gray-50 px-4 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}

          {/* Summary */}
          {preset && !error && (
            <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-700">
                Cada respuesta válida recibirá{' '}
                <span className="font-bold">
                  {preset === 'custom'
                    ? customValue
                      ? `${customValue} XLM`
                      : '— XLM'
                    : `${preset} XLM`}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/questionnaires/new?step=questions')}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
