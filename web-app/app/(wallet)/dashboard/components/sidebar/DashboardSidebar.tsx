'use client';

import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { WorkspaceNav } from './WorkspaceNav';

interface Workspace {
  id: string;
  name: string;
  forms?: { id: string }[];
}

interface DashboardSidebarProps {
  activeTab: 'active' | 'archived';
  archivedCount: number;
  onTabChange: (tab: 'active' | 'archived') => void;
  ownerAddress: string;
  selectedWorkspaceId?: string;
  onWorkspaceSelect?: (workspaceId: string) => void;
}

export function DashboardSidebar({
                                   activeTab,
                                   archivedCount,
                                   onTabChange,
                                   ownerAddress,
                                   selectedWorkspaceId,
                                   onWorkspaceSelect,
                                 }: DashboardSidebarProps) {
  const router = useRouter();
  const [ isCreating, setIsCreating ] = useState(false);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ workspaces, setWorkspaces ] = useState<Workspace[]>([]);
  const [ loadingWorkspaces, setLoadingWorkspaces ] = useState(true);
  
  // Cargar workspaces
  useEffect(() => {
    if (ownerAddress) {
      loadWorkspaces();
    }
  }, [ ownerAddress ]);
  
  const loadWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      const response = await fetch(`/api/workspaces?ownerAddress=${ownerAddress}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar workspaces');
      }
      
      const data = await response.json();
      
      // Agregar workspace "Default" al principio para formularios sin workspace
      const defaultWorkspace: Workspace = {
        id: 'default',
        name: 'My Forms',
        forms: [],
      };
      
      setWorkspaces([ defaultWorkspace, ...data ]);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      // Incluso si hay error, agregar el workspace por defecto
      const defaultWorkspace: Workspace = {
        id: 'default',
        name: 'My Forms',
        forms: [],
      };
      setWorkspaces([ defaultWorkspace ]);
    } finally {
      setLoadingWorkspaces(false);
    }
  };
  
  const handleCreateForm = async () => {
    try {
      setIsCreating(true);
      
      const workspaceIdToSend = selectedWorkspaceId === 'default' ? null : selectedWorkspaceId;
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerAddress,
          workspaceId: workspaceIdToSend,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el formulario');
      }
      
      const { id } = await response.json();
      router.push(`/form/${id}/edit`);
    } catch (error) {
      console.error('Error:', error);
      setIsCreating(false);
    }
  };
  
  const handleWorkspaceCreated = () => {
    loadWorkspaces();
  };
  
  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Create button */}
          <button
            onClick={handleCreateForm}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create a new form'}
          </button>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          </div>
          
          {/* Workspace */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-semibold text-gray-500">Workspaces</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 transition-colors hover:text-gray-600"
                title="Add workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {loadingWorkspaces ? (
              <div className="mt-2 flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
              </div>
            ) : (
              <WorkspaceNav
                workspaces={workspaces}
                activeTab={activeTab}
                selectedWorkspaceId={selectedWorkspaceId}
                archivedCount={archivedCount}
                onTabChange={onTabChange}
                onWorkspaceSelect={onWorkspaceSelect}
              />
            )}
          </div>
          
          {/* Stats */}
          <div className="mt-auto space-y-3 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs font-semibold text-gray-700">Responses collected</p>
              <p className="mt-0.5 text-sm text-gray-900">
                <span className="font-semibold">0</span>
                <span className="text-gray-500"> / 100</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
      
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleWorkspaceCreated}
        ownerAddress={ownerAddress}
      />
    </>
  );
}
