'use client';

import { Sparkles } from 'lucide-react';

interface RewardsRightSidebarProps {
  totalPaid: number;
  awardedParticipants: number;
  averagePerParticipant: number;
  payoutTimeLabel?: string;
  /** Optional: survey title for AI suggestion (e.g. first survey running low) */
  suggestionSurveyTitle?: string | null;
  suggestionMessage?: string | null;
  onApplyAdjustment?: () => void;
}

export function RewardsRightSidebar({
  totalPaid,
  awardedParticipants,
  averagePerParticipant,
  payoutTimeLabel = '2.4m',
  suggestionSurveyTitle,
  suggestionMessage,
  onApplyAdjustment,
}: RewardsRightSidebarProps) {
  const hasSuggestion = suggestionSurveyTitle || suggestionMessage;

  return (
    <aside className="flex h-full w-72 flex-col border-l border-gray-200 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {/* Métricas de Recompensas */}
        <section className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Métricas de Recompensas
          </h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Total pagado
              </p>
              <p className="mt-0.5 text-lg font-bold text-green-600">
                ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-xs text-green-600">+12% este mes</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Participantes premiados
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">
                {awardedParticipants.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Promedio: ${averagePerParticipant.toFixed(2)} /pers.
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Tiempo de payout
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary">{payoutTimeLabel}</p>
              <p className="mt-0.5 text-xs text-green-600">Instantáneo vía Stellar</p>
            </div>
          </div>
        </section>

        {/* Sugerencia de IA */}
        <section className="mb-6">
          <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-3">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Sugerencia de IA
              </p>
              {hasSuggestion ? (
                <>
                  <p className="mt-0.5 text-xs text-gray-700">
                    {suggestionMessage ??
                      (suggestionSurveyTitle
                        ? `Detectamos que el presupuesto de "${suggestionSurveyTitle}" se está agotando más rápido de lo esperado.`
                        : 'Revisa el consumo de fondos por encuesta.')}
                  </p>
                  {onApplyAdjustment && (
                    <button
                      type="button"
                      onClick={onApplyAdjustment}
                      className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
                    >
                      Aplicar ajuste
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-0.5 text-xs text-gray-700">
                  Activa las recompensas en tus formularios para aumentar la participación.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-gray-100 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Versión 2.5.0
        </p>
      </div>
    </aside>
  );
}
