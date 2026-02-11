'use client';

import { FormResponse } from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Edit,
  Link2,
  Moon,
  ShieldOff,
  Users,
  Trophy,
  Coins,
  DollarSign,
  CreditCard,
  Clock,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasRewards, setHasRewards] = useState(false);
  const [rewardAmount, setRewardAmount] = useState('0');
  const [rewardType, setRewardType] = useState('XLM');
  const [deadline, setDeadline] = useState('');
  const [distributionType, setDistributionType] = useState<'all' | 'raffle'>('all');
  const [totalBudget, setTotalBudget] = useState('0');
  const [maxResponses, setMaxResponses] = useState('100');

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/encuesta/${id}`
      : '';

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then(setForm);
  }, [id]);

  const handleDeactivate = async () => {
    if (!form) return;
    setIsDeactivating(true);
    try {
      await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      setForm((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
    } catch {
      // silently fail
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6">
        {/* ── Header ── */}
        <header className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">
                  {form.title}
                </h1>
                <p className="text-xs text-gray-500">Vista general del formulario</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/form/${id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => router.push(`/form/${id}/answers`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary-500 bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-600"
              >
                Ver Respuestas
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                  form.isActive
                    ? 'bg-[#f87171] text-white hover:bg-[#ef4444]'
                    : 'bg-success text-white hover:bg-[#059669]'
                }`}
              >
                <ShieldOff className="h-3.5 w-3.5" />
                {form.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>

          {/* ── Share Link ── */}
          <div className="border-t border-gray-100 bg-primary-50 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500">
                <Link2 className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                  Enlace público
                </p>
                <p className="truncate text-xs text-gray-700 font-medium">{shareLink}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  copied
                    ? 'bg-success text-white'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Total respuestas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-primary-500">0</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Preguntas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-primary-500">
              {form.fields?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Reward / resp.
            </p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">
              {form.rewardPerGoodAnswer ?? 0}
              <span className="ml-1 text-xs font-medium text-warning">XLM</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Estado
            </p>
            <p className={`mt-1.5 text-base font-bold ${form.isActive ? 'text-success' : 'text-destructive'}`}>
              {form.isActive ? 'Activa' : 'Inactiva'}
            </p>
          </div>
        </div>

        {/* ── Description ── */}
        {form.description && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Descripción
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">{form.description}</p>
            </div>
          </div>
        )}

        {/* ── Rewards & Deadline Configuration ── */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 border border-primary-200">
                <Coins className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Configuración de Recompensas y Plazo
                </p>
                <p className="text-xs text-gray-500">
                  Incentiva la participación con recompensas
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Toggle Recompensas */}
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900">
                    Activar Recompensas
                  </label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Los participantes recibirán una recompensa por completar la encuesta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasRewards(!hasRewards)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  hasRewards ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    hasRewards ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reward Configuration */}
            {hasRewards && (
              <div className="space-y-6 animate-fade-in">
                {/* Distribution Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Tipo de Distribución
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* All Valid Responses */}
                    <button
                      type="button"
                      onClick={() => setDistributionType('all')}
                      className={`relative p-5 rounded-lg border transition-all text-left ${
                        distributionType === 'all'
                          ? 'border-primary-600 bg-primary-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          distributionType === 'all' ? 'bg-primary-600' : 'bg-gray-100'
                        }`}>
                          <Users className={`h-5 w-5 ${distributionType === 'all' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">Todas las respuestas válidas</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Todos los que completen la encuesta recibirán la recompensa
                          </p>
                        </div>
                      </div>
                      {distributionType === 'all' && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="h-5 w-5 text-primary-600 fill-primary-100" />
                        </div>
                      )}
                    </button>

                    {/* Raffle/Lottery */}
                    <button
                      type="button"
                      onClick={() => setDistributionType('raffle')}
                      className={`relative p-5 rounded-lg border transition-all text-left ${
                        distributionType === 'raffle'
                          ? 'border-primary-600 bg-primary-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          distributionType === 'raffle' ? 'bg-primary-600' : 'bg-gray-100'
                        }`}>
                          <Trophy className={`h-5 w-5 ${distributionType === 'raffle' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">Sorteo</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Se sorteará la recompensa entre participantes válidos
                          </p>
                        </div>
                      </div>
                      {distributionType === 'raffle' && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="h-5 w-5 text-primary-600 fill-primary-100" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reward Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Recompensa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tipo de Recompensa
                    </label>
                    <select
                      value={rewardType}
                      onChange={(e) => setRewardType(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="XLM">XLM (Stellar Lumens)</option>
                      <option value="USDC">USDC</option>
                      <option value="Points">Puntos</option>
                    </select>
                  </div>

                  {/* Monto de Recompensa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Monto por Respuesta
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-600">
                        {rewardType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Max Responses (para calcular presupuesto) */}
                {distributionType === 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Número máximo de respuestas esperadas
                    </label>
                    <input
                      type="number"
                      value={maxResponses}
                      onChange={(e) => setMaxResponses(e.target.value)}
                      min="1"
                      placeholder="100"
                      className="w-full md:w-64 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                  </div>
                )}

                {/* Presupuesto Total */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 border border-blue-200">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Presupuesto Total Requerido</p>
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        {distributionType === 'all' 
                          ? (parseFloat(rewardAmount || '0') * parseFloat(maxResponses || '0')).toFixed(2)
                          : rewardAmount
                        } <span className="text-lg">{rewardType}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        {distributionType === 'all' 
                          ? `${maxResponses} respuestas × ${rewardAmount} ${rewardType} cada una`
                          : `Recompensa única para el ganador del sorteo`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="rounded-lg bg-green-50 border border-green-200 p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100 border border-green-200">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Depositar Presupuesto</p>
                        <p className="text-xs text-gray-600">
                          Deposita los fondos necesarios para activar las recompensas
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        alert('Redirigiendo a pasarela de pago...');
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pagar Ahora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-semibold text-gray-900">
                  Fecha y Hora Límite
                </label>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Establece una fecha límite para recibir respuestas
              </p>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full md:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => {
                  alert('Configuración guardada!');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <CheckCircle className="h-4 w-4" />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Moon icon */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 hover:shadow-xl hover:scale-105"
        aria-label="Cambiar tema"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
}
