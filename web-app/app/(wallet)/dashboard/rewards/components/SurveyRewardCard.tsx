'use client';

import { BarChart3, Beaker, Megaphone, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

type SurveyRewardItem = {
  id: string;
  title: string;
  isActive: boolean;
  assigned: number;
  spent: number;
  pending: number;
  participantCount: number;
  progressPercent: number;
};

interface SurveyRewardCardProps {
  survey: SurveyRewardItem;
  currency: 'USDC' | 'XLM' | 'Puntos';
}

const ICONS = [BarChart3, Megaphone, Beaker];

function getIcon(index: number) {
  return ICONS[index % ICONS.length];
}

export function SurveyRewardCard({ survey, currency }: SurveyRewardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = getIcon(survey.title.length % ICONS.length);
  const prefix = currency === 'USDC' ? '$' : '';
  const label = currency === 'USDC' ? 'USDC' : currency === 'XLM' ? 'XLM' : 'Puntos';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const status = survey.isActive ? 'ACTIVO' : 'PAUSADO';
  const statusClass = survey.isActive
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-600';
  const progressBarClass = survey.isActive
    ? 'bg-green-500'
    : 'bg-gray-400';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-gray-900">{survey.title}</h3>
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Más opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <Link
                    href={`/form/${survey.id}/rewards`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Ver recompensas
                  </Link>
                  <Link
                    href={`/form/${survey.id}/edit`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Editar formulario
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}>
              {status}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Progreso {survey.progressPercent}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${progressBarClass}`}
                style={{ width: `${Math.min(100, survey.progressPercent)}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">
            {prefix}{survey.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })} gastado
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Asignado: {prefix}{survey.assigned.toLocaleString('en-US', { minimumFractionDigits: 2 })} {label} · {survey.participantCount} Participantes
          </p>
        </div>
      </div>
    </div>
  );
}
