'use client';

import { MessageSquare } from 'lucide-react';

interface DashboardRightSidebarProps {
  totalResponses: number;
  activeFormsCount: number;
  /** Remaining reward budget across forms; undefined if not loaded. */
  totalBudgetRemaining?: number | null;
}

export function DashboardRightSidebar({
  totalResponses,
  activeFormsCount,
  totalBudgetRemaining,
}: DashboardRightSidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-l border-gray-200 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {/* Métricas Rápidas */}
        <section className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Métricas rápidas
          </h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Total de respuestas
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">{totalResponses}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Presupuesto global restante
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">
                {totalBudgetRemaining != null
                  ? `${totalBudgetRemaining.toLocaleString()} XLM`
                  : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Formularios activos
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">{activeFormsCount}</p>
            </div>
          </div>
        </section>

        {/* Sugerencia */}
        <section className="mb-6">
          <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-3">
            <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Sugerencia
              </p>
              <p className="mt-0.5 text-xs text-gray-700">
                Activa las recompensas en tus formularios para aumentar la participación.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer version */}
      <div className="shrink-0 border-t border-gray-100 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Versión 2.4.0
        </p>
      </div>
    </aside>
  );
}
