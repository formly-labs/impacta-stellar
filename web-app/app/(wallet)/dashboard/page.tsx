'use client';

import { isOnboardingCompleted } from '@/lib/onboardingStorage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';

// Hooks
import { useForms } from './components/hooks/useForms';
import { useWorkspace } from './components/hooks/useWorkspace';

// Components
import { DashboardSidebar } from './components/sidebar/DashboardSidebar';
import { DashboardHeader } from './components/header/DashboardHeader';
import { MobileControls } from './components/header/MobileControls';
import { FormList } from './components/forms/FormList';
import { InviteModal } from './components/modals/InviteModal';
import { RenameModal } from './components/modals/RenameModal';
import { LeaveModal } from './components/modals/LeaveModal';
import { DeleteModal } from './components/modals/DeleteModal';

type Tab = 'active' | 'archived';
type ViewMode = 'list' | 'grid';

export default function CreatorDashboard() {
  const { account } = useWallet();
  const router = useRouter();
  
  // Custom hooks
  const {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archivingId,
    fetchArchived,
    handleArchive,
  } = useForms(account?.address);

  const {
    workspaceName,
    workspaceMenuOpen,
    renameModalOpen,
    leaveModalOpen,
    deleteModalOpen,
    setWorkspaceMenuOpen,
    setRenameModalOpen,
    setLeaveModalOpen,
    setDeleteModalOpen,
    openRenameModal,
    handleRename: workspaceHandleRename,
  } = useWorkspace();

  // Local state
  const [tab, setTab] = useState<Tab>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isOnboardingCompleted()) {
      router.replace('/dashboard/onboarding?step=details');
    }
  }, [router]);

  // Fetch archived when switching to that tab
  useEffect(() => {
    if (tab === 'archived') {
      fetchArchived();
    }
  }, [tab, fetchArchived]);

  // Handlers
  const handleLeaveConfirm = () => {
    setLeaveModalOpen(false);
    setWorkspaceMenuOpen(false);
    router.push('/dashboard');
  };

  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    setWorkspaceMenuOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Sidebar */}
      <DashboardSidebar
        workspaceName={workspaceName}
        activeTab={tab}
        formsCount={forms.length}
        archivedCount={archivedForms.length}
        onTabChange={setTab}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 sm:p-6">
          {/* Mobile Controls */}
          <MobileControls
            workspaceName={workspaceName}
            activeTab={tab}
            viewMode={viewMode}
            onTabChange={setTab}
            onViewModeToggle={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            onInviteClick={() => setInviteModalOpen(true)}
          />

          {/* Desktop Header */}
          <DashboardHeader
            workspaceName={workspaceName}
            viewMode={viewMode}
            sortBy={sortBy}
            workspaceMenuOpen={workspaceMenuOpen}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
            onInviteClick={() => setInviteModalOpen(true)}
            onWorkspaceMenuToggle={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            onRenameClick={openRenameModal}
            onLeaveClick={() => {
              setLeaveModalOpen(true);
              setWorkspaceMenuOpen(false);
            }}
            onDeleteClick={() => {
              setDeleteModalOpen(true);
              setWorkspaceMenuOpen(false);
            }}
            setWorkspaceMenuOpen={setWorkspaceMenuOpen}
          />

          {/* Form List */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}`}>
            {tab === 'active' ? (
              <FormList
                forms={forms}
                loading={loading}
                viewMode={viewMode}
                archivingId={archivingId}
                onArchive={handleArchive}
              />
            ) : (
              <FormList
                forms={archivedForms}
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

      {/* Modals */}
      <InviteModal
        isOpen={inviteModalOpen}
        workspaceName={workspaceName}
        accountAddress={account?.address}
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
