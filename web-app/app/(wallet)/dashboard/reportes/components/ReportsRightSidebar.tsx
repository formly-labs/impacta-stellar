'use client';

import { Sparkles } from 'lucide-react';

interface ReportsRightSidebarProps {
  totalResponses: number;
  budgetRemaining: number;
  budgetTotal: number;
  activeFormsCount: number;
}

export function ReportsRightSidebar({
  totalResponses,
  budgetRemaining,
  budgetTotal,
  activeFormsCount,
}: ReportsRightSidebarProps) {
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetRemaining / budgetTotal) * 100) : 100;

  return (
    <aside className="flex h-full w-72 flex-col border-l border-gray-200 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <section className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Estadísticas globales
          </h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Total de respuestas
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">{totalResponses.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Presupuesto global restante
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">
                ${budgetRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                de ${budgetTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

        <section className="mb-6">
          <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-3">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Sugerencia IA
              </p>
              <p className="mt-0.5 text-xs text-gray-700">
                Activa las recompensas en tus formularios para aumentar la participación en un 45%
                según las tendencias actuales.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-gray-100 px-4 py-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Versión 2.4.0
        </p>
        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Sistema online
        </p>
      </div>
    </aside>
  );
}
