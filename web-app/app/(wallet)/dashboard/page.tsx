'use client';

// Hooks
import { useForms } from '@/hooks/useForms';
import { useWorkspace } from '@/hooks/useWorkspace';
import { isOnboardingCompleted } from '@/lib/onboardingStorage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';
import { FormList } from './components/forms/FormList';
import { DashboardHeader } from './components/header/DashboardHeader';
import { MobileControls } from './components/header/MobileControls';
import { DeleteModal } from './components/modals/DeleteModal';
import { InviteModal } from './components/modals/InviteModal';
import { LeaveModal } from './components/modals/LeaveModal';
import { RenameModal } from './components/modals/RenameModal';

// Components
import { DashboardSidebar } from './components/sidebar/DashboardSidebar';

type Tab = 'active' | 'archived';
type ViewMode = 'list' | 'grid';

export default function CreatorDashboard() {
  const { account } = useWallet();
  const router = useRouter();
  
  const [ selectedWorkspaceId, setSelectedWorkspaceId ] = useState<string | undefined>();
  
  const workspaceFilter = selectedWorkspaceId === 'default' ? null : selectedWorkspaceId;
  
  const {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archivingId,
    fetchArchived,
    handleArchive,
  } = useForms(account?.address, workspaceFilter);
  
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
  
  // Local state
  const [ tab, setTab ] = useState<Tab>('active');
  const [ viewMode, setViewMode ] = useState<ViewMode>('list');
  const [ sortBy, setSortBy ] = useState<'date' | 'name'>('date');
  const [ inviteModalOpen, setInviteModalOpen ] = useState(false);
  
  useEffect(() => {
    if (!isOnboardingCompleted()) {
      router.replace('/dashboard/onboarding?step=details');
    }
  }, [ router ]);
  
  useEffect(() => {
    if (tab === 'archived') {
      fetchArchived();
    }
  }, [ tab, fetchArchived ]);
  
  // Handlers
  const handleLeaveConfirm = () => {
    setLeaveModalOpen(false);
    router.push('/dashboard');
  };
  
  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    router.push('/dashboard');
  };
  
  return (
    <div className="flex h-full overflow-hidden bg-white">
      <DashboardSidebar
        activeTab={tab}
        archivedCount={archivedForms.length}
        onTabChange={setTab}
        ownerAddress={account?.address || ''}
        selectedWorkspaceId={selectedWorkspaceId}
        onWorkspaceSelect={setSelectedWorkspaceId}
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 sm:p-6">
          <MobileControls
            workspaceName={workspaceName}
            activeTab={tab}
            viewMode={viewMode}
            onTabChange={setTab}
            onViewModeToggle={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            onInviteClick={() => setInviteModalOpen(true)}
          />
          
          <DashboardHeader
            workspaceName={workspaceName}
            viewMode={viewMode}
            sortBy={sortBy}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
            onInviteClick={() => setInviteModalOpen(true)}
            onRenameClick={openRenameModal}
          />
          
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
