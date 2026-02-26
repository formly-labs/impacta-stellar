'use client';

import { usePollar } from '@pollar/react';
import { Archive, Award, BarChart3, FileText, Loader2, Plus, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardSidebarV2Props {
  activeTab: 'active' | 'archived';
  archivedCount: number;
  onTabChange: (tab: 'active' | 'archived') => void;
  onCreateForm: () => void;
  isCreatingForm: boolean;
  onCloseMobile?: () => void;
  isMobile?: boolean;
  /** @deprecated Workspace section removed from sidebar */
  ownerAddress?: string;
  /** @deprecated Workspace section removed from sidebar */
  selectedWorkspaceId?: string;
  /** @deprecated Workspace section removed from sidebar */
  onWorkspaceSelect?: (workspaceId: string) => void;
}

export function DashboardSidebarV2({
                                     activeTab,
                                     archivedCount,
                                     onTabChange,
                                     onCreateForm,
                                     isCreatingForm,
                                     onCloseMobile,
                                     isMobile,
                                   }: DashboardSidebarV2Props) {
  const pathname = usePathname();
  const { walletAddress } = usePollar();
  const [ profile, setProfile ] = useState<{ firstName?: string; lastName?: string } | null>(null);

  const isFormsPage =
    pathname === '/dashboard' ||
    (pathname?.startsWith('/dashboard') &&
      pathname !== '/dashboard/rewards' &&
      pathname !== '/dashboard/reportes' &&
      pathname !== '/dashboard/configuracion');
  const isRewardsPage = pathname === '/dashboard/rewards';
  const isReportesPage = pathname === '/dashboard/reportes';
  const isConfigPage = pathname === '/dashboard/configuracion';

  useEffect(() => {
    if (!walletAddress) return;
    fetch(`/api/profile?address=${walletAddress}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, [ walletAddress ]);

  const displayName =
    profile?.firstName || profile?.lastName
      ? [ profile.firstName, profile.lastName ].filter(Boolean).join(' ').trim()
      : null;
  const initials = displayName
    ? displayName.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    : walletAddress
      ? walletAddress.slice(1, 3).toUpperCase()
      : '?';

  return (
    <>
      <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-xl lg:shadow-none">
        <div className="flex h-full flex-col overflow-hidden">
          {/* Mobile close only; main Formly logo stays in top header */}
          {isMobile && onCloseMobile && (
            <div className="flex items-center justify-end border-b border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Crear nuevo formulario */}
          <div className="border-b border-gray-100 px-4 py-4">
            <button
              type="button"
              onClick={onCreateForm}
              disabled={isCreatingForm}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingForm ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando…
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Crear nuevo formulario
                </>
              )}
            </button>
          </div>

          {/* Menú principal */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Menú principal
            </p>
            <nav className="space-y-0.5">
              <Link
                href="/dashboard"
                onClick={() => {
                  onTabChange('active');
                  isMobile && onCloseMobile?.();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isFormsPage && activeTab === 'active'
                    ? 'border-l-4 border-primary bg-primary-50 py-2.5 pl-[calc(0.75rem-4px)] text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                Mis Formularios
              </Link>
              <Link
                href="/dashboard"
                onClick={() => {
                  onTabChange('archived');
                  isMobile && onCloseMobile?.();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isFormsPage && activeTab === 'archived'
                    ? 'border-l-4 border-primary bg-primary-50 py-2.5 pl-[calc(0.75rem-4px)] text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Archive className="h-4 w-4 shrink-0" />
                  Archivados
                </div>
                {archivedCount > 0 && (
                  <span className="text-xs text-gray-500">{archivedCount}</span>
                )}
              </Link>
              <Link
                href="/dashboard/rewards"
                onClick={isMobile ? onCloseMobile : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isRewardsPage
                    ? 'border-l-4 border-primary bg-primary-50 py-2.5 pl-[calc(0.75rem-4px)] text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Award className="h-4 w-4 shrink-0" />
                Recompensas
              </Link>
              <Link
                href="/dashboard/reportes"
                onClick={isMobile ? onCloseMobile : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isReportesPage
                    ? 'border-l-4 border-primary bg-primary-50 py-2.5 pl-[calc(0.75rem-4px)] text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                Reportes
              </Link>
              <Link
                href="/dashboard/configuracion"
                onClick={isMobile ? onCloseMobile : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isConfigPage
                    ? 'border-l-4 border-primary bg-primary-50 py-2.5 pl-[calc(0.75rem-4px)] text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                Configuración
              </Link>
            </nav>
          </div>

          {/* User block */}
          <div className="shrink-0 border-t border-gray-200 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {displayName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
