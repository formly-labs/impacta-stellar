'use client';

import { usePollar } from '@pollar/react';
import { LayoutGrid, List, Loader2, Menu, Search, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DashboardSidebarV2 } from '../components/sidebar/DashboardSidebarV2';
import { FormReportCard } from './components/FormReportCard';
import { ReportsRightSidebar } from './components/ReportsRightSidebar';

type FormReportItem = {
  id: string;
  title: string;
  isActive: boolean;
  responseCount: number;
  updatedAt: string;
};

type OverviewResponse = {
  forms: FormReportItem[];
  globalStats: {
    totalResponses: number;
    budgetRemaining: number;
    budgetTotal: number;
    activeFormsCount: number;
    responseRatePercent: number;
  };
};

export default function DashboardReportesPage() {
  const { walletAddress } = usePollar();
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const fetchOverview = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/overview?address=${encodeURIComponent(walletAddress)}`);
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

  const filteredForms =
    overview?.forms.filter((f) =>
      f.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    ) ?? [];

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

  const stats = overview?.globalStats;
  const totalResponses = stats?.totalResponses ?? 0;
  const totalParticipants = totalResponses; // same for this view
  const responseRatePercent = stats?.responseRatePercent ?? 0;

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
              placeholder="Buscar formularios..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h1 className="mb-6 text-xl font-bold text-gray-900">Resumen de Rendimiento</h1>

            {/* KPI cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Tasa de respuesta promedio
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{responseRatePercent}%</span>
                  <span className="flex items-center text-xs font-medium text-green-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +12%
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total de participantes
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalParticipants.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">Acumulado</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Tiempo medio de completado
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">2m 45s</p>
                <p className="mt-0.5 text-xs text-green-600">Eficiente</p>
              </div>
            </div>

            {/* Informes por Formulario */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Informes por Formulario
                </h2>
                <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Vista lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Vista cuadrícula"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredForms.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
                  No hay formularios para mostrar. Crea un formulario para ver sus reportes aquí.
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
                      : 'space-y-4'
                  }
                >
                  {filteredForms.map((form) => (
                    <FormReportCard key={form.id} form={form} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <div className="hidden shrink-0 lg:block">
        <ReportsRightSidebar
          totalResponses={stats?.totalResponses ?? 0}
          budgetRemaining={stats?.budgetRemaining ?? 0}
          budgetTotal={stats?.budgetTotal ?? 0}
          activeFormsCount={stats?.activeFormsCount ?? 0}
        />
      </div>
    </div>
  );
}
