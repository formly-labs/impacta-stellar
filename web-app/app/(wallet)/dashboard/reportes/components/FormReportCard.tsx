'use client';

import { FileText, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

type FormReportItem = {
  id: string;
  title: string;
  isActive: boolean;
  responseCount: number;
  updatedAt: string;
};

interface FormReportCardProps {
  form: FormReportItem;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Actualizado hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

/** Mini sparkline-style placeholder (static curve) */
function MiniChart({ hasData }: { hasData: boolean }) {
  const points = hasData
    ? [20, 35, 25, 50, 45, 70, 60, 85, 75]
    : [30, 30, 30, 30, 30, 30, 30, 30, 30];
  const w = 120;
  const h = 32;
  const max = Math.max(...points);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <path
        d={path}
        fill="none"
        stroke={hasData ? 'var(--color-primary, #7c3aed)' : '#e5e7eb'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FormReportCard({ form }: FormReportCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const updatedLabel = formatUpdatedAt(form.updatedAt);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <FileText className="h-5 w-5 text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">{form.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {form.isActive ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {updatedLabel} • {form.responseCount} {form.responseCount === 1 ? 'RESPUESTA' : 'RESPUESTAS'}
        </p>
        <div className="mt-2 flex items-center">
          <MiniChart hasData={form.responseCount > 0} />
        </div>
      </div>
      <Link
        href={`/form/${form.id}/answers`}
        className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
      >
        Ver Reporte Individual
      </Link>
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
              href={`/form/${form.id}/edit`}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Editar formulario
            </Link>
            <Link
              href={`/form/${form.id}/answers`}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Ver respuestas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
