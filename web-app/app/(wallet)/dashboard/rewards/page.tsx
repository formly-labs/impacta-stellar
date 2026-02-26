'use client';

import { usePollar } from '@pollar/react';
import { Loader2, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DashboardSidebarV2 } from '../components/sidebar/DashboardSidebarV2';
import { RewardsRightSidebar } from './components/RewardsRightSidebar';
import { SurveyRewardCard } from './components/SurveyRewardCard';

type CurrencyFilter = 'USDC' | 'XLM' | 'Puntos';

type GlobalBudget = {
  total: number;
  consumed: number;
  pending: number;
  available: number;
  utilizedPercent: number;
};

type SurveyItem = {
  id: string;
  title: string;
  isActive: boolean;
  assigned: number;
  spent: number;
  pending: number;
  participantCount: number;
  progressPercent: number;
};

type OverviewResponse = {
  globalBudget: GlobalBudget;
  surveys: SurveyItem[];
  metrics: {
    totalPaid: number;
    awardedParticipants: number;
    averagePerParticipant: number;
  };
};

export default function DashboardRewardsPage() {
  const { walletAddress } = usePollar();
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<CurrencyFilter>('USDC');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const fetchOverview = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rewards/overview?address=${encodeURIComponent(walletAddress)}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const filteredSurveys =
    overview?.surveys.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    ) ?? [];

  const currencyPrefix = currency === 'USDC' ? '$' : '';
  const currencyLabel = currency === 'USDC' ? 'USDC' : currency === 'XLM' ? 'XLM' : 'Puntos';

  const handleCreateForm = async () => {
    if (!walletAddress) return;
    setIsCreatingForm(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: walletAddress,
          title: 'Untitled Form',
          description: '',
          fields: [],
        }),
      });
      if (!res.ok) throw new Error('Error al crear');
      const { id } = await res.json();
      setMobileSidebarOpen(false);
      router.push(`/form/${id}/edit`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}
      <div className={`${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden lg:block'}`}>
        <DashboardSidebarV2
          activeTab="active"
          archivedCount={0}
          onTabChange={() => {}}
          onCreateForm={handleCreateForm}
          isCreatingForm={isCreatingForm}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isMobile={mobileSidebarOpen}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar presupuestos..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-gray-900">Gestión de Recompensas</h1>
              <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                {(['USDC', 'XLM', 'Puntos'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      currency === c ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Presupuesto global */}
                <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Presupuesto global
                      </h2>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {currencyPrefix}
                        {(overview?.globalBudget.total ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        {currencyLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const first = overview?.surveys?.[0];
                        if (first) router.push(`/form/${first.id}/rewards`);
                        else router.push('/dashboard');
                      }}
                      className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
                    >
                      Añadir fondos
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Consumo de fondos
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${overview?.globalBudget.utilizedPercent ?? 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {overview?.globalBudget.utilizedPercent ?? 0}% utilizado
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Quedan aproximadamente {currencyPrefix}
                      {(overview?.globalBudget.available ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}{' '}
                      {currencyLabel} disponibles para distribución.
                    </p>
                  </div>
                </section>

                {/* Distribución por encuesta */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Distribución por encuesta
                    </h2>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Filtros"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  {filteredSurveys.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
                      No hay encuestas con recompensas. Crea un formulario y activa recompensas para ver la distribución aquí.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSurveys.map((survey) => (
                        <SurveyRewardCard key={survey.id} survey={survey} currency={currency} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      <div className="hidden shrink-0 lg:block">
        <RewardsRightSidebar
          totalPaid={overview?.metrics.totalPaid ?? 0}
          awardedParticipants={overview?.metrics.awardedParticipants ?? 0}
          averagePerParticipant={overview?.metrics.averagePerParticipant ?? 0}
          payoutTimeLabel="2.4m"
          suggestionSurveyTitle={
            overview?.surveys.find((s) => s.progressPercent >= 70)?.title ?? null
          }
          suggestionMessage={
            overview?.surveys.some((s) => s.progressPercent >= 70)
              ? 'Reduce la recompensa individual para cubrir más participantes sin añadir fondos.'
              : null
          }
          onApplyAdjustment={() => {
            const survey = overview?.surveys.find((s) => s.progressPercent >= 70);
            if (survey) router.push(`/form/${survey.id}/rewards`);
          }}
        />
      </div>
    </div>
  );
}
