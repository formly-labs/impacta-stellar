'use client';

import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { useFormData } from '@/hooks';
import {
  ArrowLeft,
  ChevronDown,
  DollarSign,
  Filter,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const MOCK_PARTICIPANTS = [
  {
    id: 'p1',
    walletAddress: 'GD6NGF...55A1',
    name: 'Jorge D.',
    initials: 'JD',
    color: 'bg-yellow-400',
    timeAgo: 'Hace 2 min',
    aiScore: 9.8,
    scoreColor: 'bg-green-100 text-green-700',
    reward: 25.0,
  },
  {
    id: 'p2',
    walletAddress: 'AX8B0P...22Z4',
    name: 'María L.',
    initials: 'ML',
    color: 'bg-gray-300',
    timeAgo: 'Hace 15 min',
    aiScore: 9.2,
    scoreColor: 'bg-green-100 text-green-700',
    reward: 15.0,
  },
  {
    id: 'p3',
    walletAddress: 'TY5Q2W...99X2',
    name: 'Raúl T.',
    initials: 'RT',
    color: 'bg-gray-300',
    timeAgo: 'Hace 1 hora',
    aiScore: 8.1,
    scoreColor: 'bg-yellow-100 text-yellow-700',
    reward: 10.0,
  },
];

const MOCK_BUDGET = {
  total: 2000.0,
  consumed: 1240.0,
  pending: 150.0,
  costPerWinner: 10.0,
  totalWinners: 124,
};

export default function RewardsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { isLoading } = useFormData(formId);

  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [showEditToast, setShowEditToast] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  useEffect(() => {
    if (!params.id) {
      router.push('/dashboard');
    }
  }, [params.id, router]);

  const handleEdit = () => {
    setShowEditToast(true);
    setTimeout(() => setShowEditToast(false), 2500);
  };

  const percentConsumed = Math.round(
    (MOCK_BUDGET.consumed / MOCK_BUDGET.total) * 100,
  );
  const remaining = MOCK_BUDGET.total - MOCK_BUDGET.consumed;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <FormEditNavigation formId={formId} activeTab="rewards" />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-sm text-gray-500">Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <FormEditNavigation formId={formId} activeTab="rewards" />

      {/* Toast "Próximamente" */}
      {showEditToast && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-3 shadow-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gray-800">
              Próximamente — Edición de recompensas individuales
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/form/${formId}/edit`)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Panel de Recompensas
              </h1>
              <p className="text-sm text-gray-500">
                Control de Presupuesto y Premios
              </p>
            </div>
          </div>

          {/* Budget + Add Funds */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Estado del Presupuesto */}
            <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Estado del Presupuesto
                  </h2>
                  <p className="text-sm text-gray-500">
                    Supervisión en tiempo real de los fondos asignados.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    ${MOCK_BUDGET.consumed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-base font-normal text-gray-400">
                      {' '}/ ${MOCK_BUDGET.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-primary">
                    {percentConsumed}% Consumido
                  </span>
                  <span className="text-gray-500">
                    Fondos Restantes: ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentConsumed}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Pagos Pendientes
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    ${MOCK_BUDGET.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Costo por Ganador
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    ${MOCK_BUDGET.costPerWinner.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Ganadores Totales
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {MOCK_BUDGET.totalWinners}
                  </p>
                </div>
              </div>
            </div>

            {/* Añadir Fondos */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Añadir Fondos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Incrementa el presupuesto para habilitar más recompensas a tus
                participantes.
              </p>

              <div className="mt-5">
                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="0.00"
                    className="ml-2 flex-1 border-0 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              <button className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
                Confirmar Recarga
              </button>
            </div>
          </div>

          {/* Participantes Destacados */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Participantes Destacados
                </h2>
                <p className="text-sm text-gray-500">
                  Analizados automáticamente por calidad de respuesta.
                </p>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-4 border-b border-gray-100 px-6 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Id de participante
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Calidad (AI Score)
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Recompensa individual
              </p>
              <p className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Acciones
              </p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {MOCK_PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-4 items-center px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  {/* Participant */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${p.color} text-xs font-bold text-white`}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.walletAddress}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.name} · {p.timeAgo}
                      </p>
                    </div>
                  </div>

                  {/* AI Score */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${p.scoreColor}`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {p.aiScore}
                    </span>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium">
                      {p.reward.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="text-right">
                    <button
                      onClick={handleEdit}
                      className="text-sm font-medium text-primary transition-colors hover:text-primary-700"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show all */}
            <div className="border-t border-gray-100 px-6 py-4 text-center">
              <button
                onClick={() => setShowAllParticipants(!showAllParticipants)}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                Ver todos los participantes
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAllParticipants ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400">
              © 2024 Formly Dashboard. Recompensas Automatizadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
