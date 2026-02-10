'use client';

import { ArrowLeft, ArrowRight, Coins, Gift, XCircle } from 'lucide-react';
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

  // null = hasn't answered yet, true = yes, false = no
  const [wantsRewards, setWantsRewards] = useState<boolean | null>(null);
  const [preset, setPreset] = useState<RewardPreset | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from draft
  useEffect(() => {
    const draft = loadQuestionnaireDraft();
    if (draft.wantsRewards != null) {
      setWantsRewards(draft.wantsRewards);
    }
    if (draft.rewardPreset) {
      setPreset(draft.rewardPreset);
      if (draft.rewardPreset === 'custom' && draft.rewardPerGoodAnswer != null) {
        setCustomValue(String(draft.rewardPerGoodAnswer));
      }
    }
  }, []);

  // Debounced save
  const persist = useCallback(
    (wants: boolean, p: RewardPreset | null, amount: number | undefined) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveQuestionnaireDraft({
          wantsRewards: wants,
          rewardPreset: p ?? undefined,
          rewardPerGoodAnswer: wants ? amount : 0,
        });
      }, 300);
    },
    [],
  );

  // Toggle rewards choice
  const handleChoice = useCallback(
    (wants: boolean) => {
      setWantsRewards(wants);
      setError('');
      if (!wants) {
        // Reset reward config
        setPreset(null);
        setCustomValue('');
        persist(false, null, 0);
      } else {
        // Persist current selection if any
        const amount =
          preset === 'custom'
            ? parseFloat(customValue) || undefined
            : preset
              ? Number(preset)
              : undefined;
        persist(true, preset, amount);
      }
    },
    [persist, preset, customValue],
  );

  const selectPreset = useCallback(
    (p: RewardPreset) => {
      setPreset(p);
      setError('');
      if (p !== 'custom') {
        const amount = Number(p);
        setCustomValue('');
        persist(true, p, amount);
      } else {
        const num = parseFloat(customValue);
        persist(true, p, isNaN(num) ? undefined : num);
      }
    },
    [customValue, persist],
  );

  const handleCustomChange = useCallback(
    (raw: string) => {
      if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) return;
      setCustomValue(raw);
      setError('');
      const num = parseFloat(raw);
      persist(true, 'custom', isNaN(num) ? undefined : num);
    },
    [persist],
  );

  const validate = useCallback((): boolean => {
    if (wantsRewards === null) {
      setError('Selecciona una opción para continuar');
      return false;
    }
    if (!wantsRewards) {
      return true; // No rewards selected — valid
    }
    // wantsRewards === true
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
  }, [wantsRewards, preset, customValue]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;

    if (wantsRewards) {
      const amount =
        preset === 'custom' ? parseFloat(customValue) : Number(preset);
      saveQuestionnaireDraft({
        wantsRewards: true,
        rewardPreset: preset!,
        rewardPerGoodAnswer: amount,
      });
    } else {
      saveQuestionnaireDraft({
        wantsRewards: false,
        rewardPreset: undefined,
        rewardPerGoodAnswer: 0,
      });
    }

    window.dispatchEvent(
      new CustomEvent('formly:toast', {
        detail: wantsRewards ? 'Recompensa guardada' : 'Sin recompensas — continuando',
      }),
    );
    router.push('/dashboard/questionnaires/new?step=finalize');
  }, [validate, wantsRewards, preset, customValue, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-lg font-bold uppercase tracking-widest text-blue-600">
            Paso 05 — Recompensas
          </p>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-tight">
            Configurar <span className="font-bold">recompensas</span>
          </h1>
        </div>

        {/* ── Question: Do you want rewards? ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-gray-900">
            ¿Quieres dar recompensas por estas respuestas?
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Si activas recompensas, cada respuesta válida recibirá XLM.
          </p>

          <div className="mt-5 flex gap-4">
            {/* Sí */}
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                wantsRewards === true
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Gift
                className={`h-7 w-7 ${
                  wantsRewards === true ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  wantsRewards === true ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                Sí, quiero dar recompensas
              </span>
            </button>

            {/* No */}
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                wantsRewards === false
                  ? 'border-gray-800 bg-gray-900 shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <XCircle
                className={`h-7 w-7 ${
                  wantsRewards === false ? 'text-white' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  wantsRewards === false ? 'text-white' : 'text-gray-700'
                }`}
              >
                No, sin recompensas
              </span>
            </button>
          </div>
        </div>

        {/* ── Reward configuration (only if "Sí") ── */}
        {wantsRewards === true && (
          <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
              <Coins className="h-6 w-6 text-yellow-500" />
            </div>

            <p className="mb-4 text-sm font-medium text-gray-700">
              Elige cuánto pagarás por cada buena respuesta:
            </p>

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
              <div className="mt-5 space-y-1.5 animate-fade-in">
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
        )}

        {/* ── "No rewards" confirmation ── */}
        {wantsRewards === false && (
          <div className="animate-fade-in rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600">
                Tu encuesta no ofrecerá recompensas en XLM. Puedes cambiar esto más adelante.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/questionnaires/new?step=preview')}
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
