'use client';

import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { useFormData } from '@/hooks';
import {
  DollarSign,
  Pencil,
  Zap,
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
  'bg-primary-500',
  'bg-primary-600',
  'bg-gray-600',
  'bg-gray-700',
];

function getInitials(name: string | null, walletAddress: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return walletAddress.slice(2, 4).toUpperCase();
}

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function truncateStellarId(wallet: string): string {
  if (!wallet || wallet.length < 10) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-2)}`;
}

function displayName(name: string | null, wallet: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}.`;
    return parts[0].slice(0, 12);
  }
  return `${wallet.slice(2, 3).toUpperCase()}${wallet.slice(3, 4)}`;
}

export default function RewardsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { isLoading } = useFormData(formId);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  const [currency, setCurrency] = useState<'XLM' | 'USDC' | 'Puntos'>('XLM');
  const [budgetDisabled, setBudgetDisabled] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [editRewardValue, setEditRewardValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showAllWinners, setShowAllWinners] = useState(false);

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
    async () => {
      setParticipantsLoading(true);
      try {
        const limit = showAllWinners ? 50 : 10;
        const res = await fetch(
          `/api/forms/${formId}/rewards/participants?page=1&limit=${limit}&sort=aiScore&order=desc`,
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
    [formId, showAllWinners],
  );

  useEffect(() => {
    if (!params.id) {
      router.push('/dashboard');
      return;
    }
    fetchBudget();
  }, [params.id, router, fetchBudget]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleEditStart = (p: Participant) => {
    setEditingParticipant(p.id);
    setEditRewardValue(p.reward.toString());
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
        fetchParticipants();
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
        setShowEditBudget(false);
        fetchBudget();
      }
    } finally {
      setFundLoading(false);
    }
  };

  const handlePayAll = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}/rewards/distribute`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchBudget();
        fetchParticipants();
      }
    } catch {
      // ignore
    }
  };

  const percentConsumed = budget
    ? Math.min(100, Math.round((budget.consumed / (budget.total || 1)) * 100))
    : 0;
  const currencyPrefix = currency === 'USDC' ? '$' : '';
  const currencyLabel = currency === 'XLM' ? 'XLM' : currency === 'USDC' ? 'USDC' : 'Puntos';

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
    <div className="flex h-full flex-col bg-gray-50">
      <FormEditNavigation formId={formId} activeTab="rewards" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* PRESUPUESTO TOTAL */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Presupuesto total
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowEditBudget((v) => !v)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Editar presupuesto"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Desactivar presupuesto
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={budgetDisabled}
                    onClick={() => setBudgetDisabled((b) => !b)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      budgetDisabled ? 'bg-gray-300' : 'bg-primary'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        budgetDisabled ? 'translate-x-1' : 'translate-x-6'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {showEditBudget ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      placeholder="0.00"
                      className="ml-2 w-32 border-0 bg-transparent text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={handleFund}
                    disabled={fundLoading || !addFundsAmount || parseFloat(addFundsAmount) <= 0}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                  >
                    {fundLoading ? 'Procesando...' : 'Añadir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditBudget(false); setAddFundsAmount(''); }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {currencyPrefix}
                      {(budget?.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {' '}{currencyLabel}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-primary">
                        {percentConsumed}% consumido
                      </span>
                      <span className="text-gray-500">
                        {currencyPrefix}
                        {(budget?.consumed ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {' '}{currencyLabel} utilizados
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentConsumed}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* MONEDA DE RECOMPENSA */}
            <section>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Moneda de recompensa
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['XLM', 'USDC', 'Puntos'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                      currency === c
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            {/* Payment buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Wallet className="h-4 w-4" />
                Pago customizable
              </button>
              <button
                type="button"
                onClick={handlePayAll}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600"
              >
                <Zap className="h-4 w-4" />
                Pagar a todos
              </button>
            </div>

            {/* LISTADO DE GANADORES */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Listado de ganadores
                </h2>
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  En tiempo real
                </span>
              </div>

              {participantsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                      </div>
                      <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
                  No hay ganadores todavía.
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(p.id)}`}
                      >
                        {getInitials(p.name, p.walletAddress)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">
                          {displayName(p.name, p.walletAddress)}
                        </p>
                        <p className="text-xs text-gray-500">
                          stellar_id: {truncateStellarId(p.walletAddress)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {editingParticipant === p.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editRewardValue}
                              onChange={(e) => setEditRewardValue(e.target.value)}
                              className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditSave(p.id)}
                              disabled={editLoading}
                              className="text-sm font-medium text-primary"
                            >
                              {editLoading ? '...' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-sm font-medium text-gray-500"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <p className="font-bold text-gray-900">
                            {currencyPrefix}{p.reward.toFixed(2)} {currencyLabel}
                          </p>
                        )}
                      </div>
                      {editingParticipant !== p.id && p.status === 'pending' && (
                        <button
                          onClick={() => handleEditStart(p)}
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {totalParticipants > participants.length && (
                <button
                  onClick={() => setShowAllWinners(true)}
                  className="mt-4 w-full rounded-xl border border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-primary hover:bg-primary-50 hover:text-primary"
                >
                  Ver todos los ganadores
                </button>
              )}
              {showAllWinners && totalParticipants > 10 && (
                <button
                  onClick={() => setShowAllWinners(false)}
                  className="mt-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Ver menos
                </button>
              )}
            </section>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-gray-200 bg-white lg:flex">
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            {/* Network info */}
            <section className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Información de red
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                <li>Protocolo: Stellar Mainnet</li>
                <li>Fee promedio: 0.0001 XLM</li>
                <li className="flex items-center gap-1.5">
                  Estado: <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Sincronizado
                </li>
              </ul>
            </section>

            {/* Sugerencia */}
            <section className="mb-6">
              <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Sugerencia
                </h3>
                <p className="mt-2 text-sm text-gray-700">
                  {percentConsumed >= 50
                    ? `Has alcanzado el ${percentConsumed}% de tu presupuesto. Considera ajustar los montos para los siguientes participantes.`
                    : 'Activa las recompensas en tu formulario para aumentar la participación.'}
                </p>
              </div>
            </section>

          </div>
          <div className="shrink-0 border-t border-gray-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Protocolo v3.0.1
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
