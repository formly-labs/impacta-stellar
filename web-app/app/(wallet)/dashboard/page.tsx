'use client';

import { useForms } from '@/hooks/useForms';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePollar } from '@pollar/react';
import { AlertCircle, LayoutGrid, List, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormList } from './components/forms/FormList';
import { DashboardHeaderV2 } from './components/header/DashboardHeaderV2';
import { MobileControls } from './components/header/MobileControls';
import { DeleteModal } from './components/modals/DeleteModal';
import { InviteModal } from './components/modals/InviteModal';
import { LeaveModal } from './components/modals/LeaveModal';
import { RenameModal } from './components/modals/RenameModal';
import { DashboardRightSidebar } from './components/right-sidebar/DashboardRightSidebar';
import { DashboardSidebarV2 } from './components/sidebar/DashboardSidebarV2';

type Tab = 'active' | 'archived';
type ViewMode = 'list' | 'grid';

export default function CreatorDashboard() {
  const { walletAddress } = usePollar();
  const router = useRouter();

  const [ selectedWorkspaceId, setSelectedWorkspaceId ] = useState<string | undefined>();
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ isCreatingForm, setIsCreatingForm ] = useState(false);
  const [ createError, setCreateError ] = useState<string | null>(null);
  const [ mobileSidebarOpen, setMobileSidebarOpen ] = useState(false);

  const workspaceFilter = selectedWorkspaceId === 'default' ? null : selectedWorkspaceId;

  const {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archivingId,
    fetchArchived,
    handleArchive,
  } = useForms(walletAddress, workspaceFilter);

  const {
    workspaceName,
    renameModalOpen,
    leaveModalOpen,
    deleteModalOpen,
    setRenameModalOpen,
    setLeaveModalOpen,
    setDeleteModalOpen,
    openRenameModal,
    handleRename: workspaceHandleRename,
  } = useWorkspace();

  const [ tab, setTab ] = useState<Tab>('active');
  const [ viewMode, setViewMode ] = useState<ViewMode>('list');
  const [ sortBy, setSortBy ] = useState<'date' | 'name'>('date');
  const [ inviteModalOpen, setInviteModalOpen ] = useState(false);

  useEffect(() => {
    if (tab === 'archived') {
      fetchArchived();
    }
  }, [ tab, fetchArchived ]);

  const handleCreateForm = async () => {
    if (!walletAddress) return;
    setCreateError(null);
    setIsCreatingForm(true);
    try {
      const workspaceIdToSend = selectedWorkspaceId === 'default' ? null : selectedWorkspaceId;
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: walletAddress,
          workspaceId: workspaceIdToSend,
          title: 'Untitled Form',
          description: '',
          fields: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Error al crear el formulario');
      }
      const { id } = await res.json();
      setMobileSidebarOpen(false);
      router.push(`/form/${id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el formulario');
      setIsCreatingForm(false);
    }
  };

  const handleLeaveConfirm = () => {
    setLeaveModalOpen(false);
    router.push('/dashboard');
  };

  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    router.push('/dashboard');
  };

  const baseForms = tab === 'active' ? forms : archivedForms;
  const totalResponses =
    forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0) +
    archivedForms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
  const activeFormsCount = forms.filter((f) => f.isActive).length;

  const filteredForms = searchQuery.trim()
    ? baseForms.filter(
      (f) =>
        f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : baseForms;

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}
      {/* Left sidebar */}
      <div className={`${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden lg:block'}`}>
        <DashboardSidebarV2
          activeTab={tab}
          archivedCount={archivedForms.length}
          onTabChange={setTab}
          ownerAddress={walletAddress}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceSelect={setSelectedWorkspaceId}
          onCreateForm={handleCreateForm}
          isCreatingForm={isCreatingForm}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isMobile={mobileSidebarOpen}
        />
      </div>

      {/* Center: header + main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeaderV2
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeToggle={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {createError && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateError(null)}
                  className="shrink-0 rounded p-1 text-red-600 hover:bg-red-100"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <MobileControls
              workspaceName={workspaceName}
              activeTab={tab}
              viewMode={viewMode}
              onTabChange={setTab}
              onViewModeToggle={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
              onInviteClick={() => setInviteModalOpen(true)}
            />

            {/* Section title + view toggle */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Mis Formularios</h1>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vista lista"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vista cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-2'
              }
            >
              {tab === 'active' ? (
                <FormList
                  forms={filteredForms}
                  loading={loading}
                  viewMode={viewMode}
                  archivingId={archivingId}
                  onArchive={handleArchive}
                />
              ) : (
                <FormList
                  forms={filteredForms}
                  loading={loadingArchived}
                  viewMode={viewMode}
                  archivingId={archivingId}
                  isArchived
                  onArchive={handleArchive}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Right sidebar – Métricas Rápidas, Sugerencia, Upgrade Pro */}
      <div className="hidden shrink-0 lg:block">
        <DashboardRightSidebar
          totalResponses={totalResponses}
          activeFormsCount={activeFormsCount}
          totalBudgetRemaining={undefined}
        />
      </div>

      <InviteModal
        isOpen={inviteModalOpen}
        workspaceName={workspaceName}
        accountAddress={walletAddress}
        onClose={() => setInviteModalOpen(false)}
      />
      <RenameModal
        isOpen={renameModalOpen}
        workspaceName={workspaceName}
        onClose={() => setRenameModalOpen(false)}
        onRename={workspaceHandleRename}
      />
      <LeaveModal
        isOpen={leaveModalOpen}
        workspaceName={workspaceName}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleLeaveConfirm}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        workspaceName={workspaceName}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
