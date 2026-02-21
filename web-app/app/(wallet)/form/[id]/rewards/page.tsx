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
import { useCallback, useEffect, useState } from 'react';

type Budget = {
  total: number;
  consumed: number;
  pending: number;
  costPerWinner: number;
  totalWinners: number;
};

type Participant = {
  id: string;
  walletAddress: string;
  name: string | null;
  respondedAt: string;
  aiScore: number;
  reward: number;
  status: 'pending' | 'paid';
};

const AVATAR_COLORS = [
  'bg-yellow-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-gray-300',
];

function getInitials(name: string | null, walletAddress: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return walletAddress.slice(0, 2).toUpperCase();
}

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function getScoreColor(score: number): string {
  if (score >= 9) return 'bg-green-100 text-green-700';
  if (score >= 7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getTimeAgo(respondedAt: string): string {
  const diff = Date.now() - new Date(respondedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function RewardsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { isLoading } = useFormData(formId);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [editRewardValue, setEditRewardValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const fetchBudget = useCallback(async () => {
    setBudgetLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}/rewards/budget`);
      if (res.ok) setBudget(await res.json());
    } finally {
      setBudgetLoading(false);
    }
  }, [formId]);

  const fetchParticipants = useCallback(
    async (page: number) => {
      setParticipantsLoading(true);
      try {
        const limit = showAllParticipants ? 50 : 10;
        const res = await fetch(
          `/api/forms/${formId}/rewards/participants?page=${page}&limit=${limit}&sort=aiScore&order=desc`,
        );
        if (res.ok) {
          const data = await res.json();
          setParticipants(data.participants);
          setTotalParticipants(data.total);
        }
      } finally {
        setParticipantsLoading(false);
      }
    },
    [formId, showAllParticipants],
  );

  useEffect(() => {
    if (!params.id) {
      router.push('/dashboard');
      return;
    }
    fetchBudget();
  }, [params.id, router, fetchBudget]);

  useEffect(() => {
    fetchParticipants(participantsPage);
  }, [fetchParticipants, participantsPage]);

  const handleEditStart = (participant: Participant) => {
    setEditingParticipant(participant.id);
    setEditRewardValue(participant.reward.toString());
  };

  const handleEditSave = async (participantId: string) => {
    const newReward = parseFloat(editRewardValue);
    if (isNaN(newReward) || newReward < 0) return;
    setEditLoading(true);
    try {
      const res = await fetch(
        `/api/forms/${formId}/rewards/participants/${participantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reward: newReward }),
        },
      );
      if (res.ok) {
        setEditingParticipant(null);
        fetchParticipants(participantsPage);
        fetchBudget();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingParticipant(null);
    setEditRewardValue('');
  };

  const handleFund = async () => {
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) return;
    setFundLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}/rewards/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        setAddFundsAmount('');
        fetchBudget();
      }
    } finally {
      setFundLoading(false);
    }
  };

  const handleToggleAll = () => {
    setShowAllParticipants((prev) => !prev);
    setParticipantsPage(1);
  };

  const percentConsumed = budget
    ? Math.min(100, Math.round((budget.consumed / (budget.total || 1)) * 100))
    : 0;
  const remaining = budget ? budget.total - budget.consumed : 0;

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

      {/* (inline editing is now in the participants table) */}

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
                  {budgetLoading ? (
                    <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-100" />
                  ) : (
                    <p className="text-3xl font-bold text-primary">
                      ${(budget?.consumed ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-base font-normal text-gray-400">
                        {' '}/ ${(budget?.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  )}
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
                  {budgetLoading ? (
                    <div className="mt-1 h-7 w-20 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      ${(budget?.pending ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Costo por Ganador
                  </p>
                  {budgetLoading ? (
                    <div className="mt-1 h-7 w-20 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-primary">
                      ${(budget?.costPerWinner ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Ganadores Totales
                  </p>
                  {budgetLoading ? (
                    <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {budget?.totalWinners ?? 0}
                    </p>
                  )}
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

              <button
                onClick={handleFund}
                disabled={fundLoading || !addFundsAmount || parseFloat(addFundsAmount) <= 0}
                className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fundLoading ? 'Procesando...' : 'Confirmar Recarga'}
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
              {participantsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 items-center px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                    <div className="flex justify-end">
                      <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              ) : participants.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-400">
                  No hay participantes todavía.
                </div>
              ) : (
                participants.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-4 items-center px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    {/* Participant */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${getAvatarColor(p.id)} text-xs font-bold text-white`}
                      >
                        {getInitials(p.name, p.walletAddress)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {p.walletAddress}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.name ? `${p.name} · ` : ''}{getTimeAgo(p.respondedAt)}
                        </p>
                      </div>
                    </div>

                    {/* AI Score */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(p.aiScore)}`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {p.aiScore}
                      </span>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      {editingParticipant === p.id ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="number"
                            value={editRewardValue}
                            onChange={(e) => setEditRewardValue(e.target.value)}
                            className="w-20 rounded border border-gray-300 px-2 py-0.5 text-sm focus:border-primary focus:outline-none"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium">
                            {p.reward.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {editingParticipant === p.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(p.id)}
                            disabled={editLoading}
                            className="text-sm font-medium text-green-600 transition-colors hover:text-green-800 disabled:opacity-50"
                          >
                            {editLoading ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditStart(p)}
                          disabled={p.status === 'paid'}
                          className="text-sm font-medium text-primary transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Show all */}
            <div className="border-t border-gray-100 px-6 py-4 text-center">
              <button
                onClick={handleToggleAll}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {showAllParticipants
                  ? 'Ver menos'
                  : `Ver todos los participantes${totalParticipants > 0 ? ` (${totalParticipants})` : ''}`}
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