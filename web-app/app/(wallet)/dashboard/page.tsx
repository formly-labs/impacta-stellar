'use client';

import { FormResponse } from '@/types';
import { isOnboardingCompleted } from '@/lib/onboardingStorage';
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  Coins,
  FileText,
  Loader2,
  Moon,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';

type Tab = 'active' | 'archived';

// Demo data shown when no real forms exist
const DEMO_FORMS = [
  { id: 'demo-1', title: 'Encuesta de Satisfacción 2024', updatedLabel: 'Actualizado hace 2 horas', responses: 0, isActive: true },
  { id: 'demo-2', title: 'Feedback de Producto Alpha', updatedLabel: 'Actualizado ayer', responses: 124, isActive: true },
  { id: 'demo-3', title: 'Registro de Evento Stellar', updatedLabel: 'Actualizado el 15 Oct', responses: 56, isActive: false },
  { id: 'demo-4', title: 'Test de UX Mobile', updatedLabel: 'Actualizado el 10 Oct', responses: 0, isActive: true },
];

export default function CreatorDashboard() {
  const { account } = useWallet();
  const router = useRouter();
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [archivedForms, setArchivedForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<Tab>('active');
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isOnboardingCompleted()) {
      router.replace('/dashboard/onboarding?step=details');
    }
  }, [router]);

  // Fetch active forms
  const fetchForms = useCallback(() => {
    if (!account?.address) return;
    fetch(`/api/forms?address=${account.address}`)
      .then(res => res.json())
      .then(data => {
        setForms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [account?.address]);

  // Fetch archived forms
  const fetchArchived = useCallback(() => {
    if (!account?.address) return;
    setLoadingArchived(true);
    fetch(`/api/forms?address=${account.address}&archived=true`)
      .then(res => res.json())
      .then(data => {
        setArchivedForms(Array.isArray(data) ? data : []);
        setLoadingArchived(false);
      })
      .catch(() => setLoadingArchived(false));
  }, [account?.address]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Fetch archived when switching to that tab
  useEffect(() => {
    if (tab === 'archived') {
      fetchArchived();
    }
  }, [tab, fetchArchived]);

  const handleArchive = async (formId: string, archive: boolean) => {
    setArchivingId(formId);
    try {
      const res = await fetch(`/api/forms/${formId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: archive }),
      });
      if (res.ok) {
        if (archive) {
          // Move from active → archived
          const moved = forms.find(f => f.id === formId);
          setForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setArchivedForms(prev => [moved, ...prev]);
        } else {
          // Move from archived → active
          const moved = archivedForms.find(f => f.id === formId);
          setArchivedForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setForms(prev => [moved, ...prev]);
        }
      }
    } catch {
      // silently fail
    } finally {
      setArchivingId(null);
    }
  };

  // Use demo data when no real forms
  const showDemo = !loading && forms.length === 0 && tab === 'active';
  const totalForms = showDemo ? 12 : forms.length;

  const filteredDemo = DEMO_FORMS.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredForms = forms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredArchived = archivedForms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Mis Formularios
            </h1>
            <p className="mt-1 text-gray-500">
              Gestiona tus encuestas e incentivos de Stellar.
            </p>
          </div>
          <Link
            href="/dashboard/questionnaires/new?step=theme"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo
          </Link>
        </header>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 text-gray-400">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Total Formularios
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{totalForms}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 text-gray-400">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Respuestas Totales
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 text-gray-400">
              <Coins className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Fondos en Circulación
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              0.00 <span className="text-lg font-medium text-gray-400">XLM</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Activas
            {forms.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                tab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {forms.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('archived')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === 'archived'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <Archive className="h-4 w-4" />
            Archivadas
            {archivedForms.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                tab === 'archived' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {archivedForms.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título..."
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Form list */}
        <div className="mt-4 space-y-3">
          {/* ── Active tab ── */}
          {tab === 'active' && (
            <>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : showDemo ? (
                filteredDemo.map((form) => (
                  <div
                    key={form.id}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{form.title}</p>
                      <p className="text-xs text-gray-400">{form.updatedLabel}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Respuestas</p>
                      <p className="text-lg font-bold text-gray-900">{form.responses}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</p>
                      <span className={`text-[10px] font-bold uppercase ${form.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                        {form.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
                  </div>
                ))
              ) : filteredForms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                  <p className="text-gray-400">No se encontraron formularios.</p>
                </div>
              ) : (
                filteredForms.map((form) => (
                  <div
                    key={form.id}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    {/* Link area */}
                    <Link
                      href={`/dashboard/creator/${form.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{form.title}</p>
                        <p className="text-xs text-gray-400">{form.description}</p>
                      </div>
                    </Link>

                    {/* Status */}
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</p>
                      <span className={`text-[10px] font-bold uppercase ${form.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                        {form.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>

                    {/* Archive button */}
                    <button
                      type="button"
                      onClick={() => handleArchive(form.id, true)}
                      disabled={archivingId === form.id}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                      title="Archivar"
                    >
                      {archivingId === form.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>

                    <Link href={`/dashboard/creator/${form.id}`}>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
                    </Link>
                  </div>
                ))
              )}
            </>
          )}

          {/* ── Archived tab ── */}
          {tab === 'archived' && (
            <>
              {loadingArchived ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredArchived.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                  <Archive className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-gray-400">No hay encuestas archivadas.</p>
                </div>
              ) : (
                filteredArchived.map((form) => (
                  <div
                    key={form.id}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    {/* Link area */}
                    <Link
                      href={`/dashboard/creator/${form.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-500">{form.title}</p>
                        <p className="text-xs text-gray-400">{form.description}</p>
                      </div>
                    </Link>

                    {/* Archived badge */}
                    <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:inline-block">
                      Archivada
                    </span>

                    {/* Restore button */}
                    <button
                      type="button"
                      onClick={() => handleArchive(form.id, false)}
                      disabled={archivingId === form.id}
                      className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                      title="Restaurar"
                    >
                      {archivingId === form.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArchiveRestore className="h-4 w-4" />
                          <span className="hidden sm:inline">Restaurar</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Moon icon bottom-right */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label="Cambiar tema"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
}
