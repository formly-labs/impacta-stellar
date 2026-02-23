'use client';

import { FormResponse } from '@/types';
import { Archive, ArchiveRestore, FileText, Loader2, MoreHorizontal, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { formatCreatedAgo } from './formatCreatedAgo';

interface FormCardProps {
  form: FormResponse;
  isArchived?: boolean;
  archivingId: string | null;
  onArchive: (formId: string, archive: boolean) => void;
}

function getStatus(form: FormResponse, isArchived: boolean): 'ACTIVO' | 'PENDIENTE' | 'INACTIVO' {
  if (isArchived) return 'INACTIVO';
  if (form.isActive) return 'ACTIVO';
  return 'PENDIENTE';
}

function StatusPill({ status }: { status: 'ACTIVO' | 'PENDIENTE' | 'INACTIVO' }) {
  const styles = {
    ACTIVO: 'bg-green-100 text-green-700',
    PENDIENTE: 'bg-amber-100 text-amber-700',
    INACTIVO: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

export function FormCard({ form, isArchived = false, archivingId, onArchive }: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoading = archivingId === form.id;
  const status = getStatus(form, isArchived);
  const responseCount = form.responseCount ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className={`group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md ${
        isArchived ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
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
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onArchive(form.id, !isArchived);
                }}
                disabled={isLoading}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isArchived ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
                {isArchived ? 'Restaurar' : 'Archivar'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Link href={`/form/${form.id}/edit`} className="mt-3 block">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{form.title}</h3>
          <StatusPill status={status} />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {formatCreatedAgo(form.createdAt)}
          {responseCount > 0 && ` • ${responseCount} ${responseCount === 1 ? 'respuesta' : 'respuestas'}`}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {responseCount} {responseCount === 1 ? 'respuesta' : 'respuestas'}
        </p>
      </Link>
    </div>
  );
}
