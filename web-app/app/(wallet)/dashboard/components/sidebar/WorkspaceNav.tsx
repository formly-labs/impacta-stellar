'use client';

import { Archive, Folder, Home } from 'lucide-react';
import { useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
  forms?: { id: string }[];
}

interface WorkspaceNavProps {
  workspaces: Workspace[];
  activeTab: 'active' | 'archived';
  selectedWorkspaceId?: string;
  archivedCount: number;
  onTabChange: (tab: 'active' | 'archived') => void;
  onWorkspaceSelect?: (workspaceId: string) => void;
}

export function WorkspaceNav({
                               workspaces,
                               activeTab,
                               selectedWorkspaceId,
                               archivedCount,
                               onTabChange,
                               onWorkspaceSelect,
                             }: WorkspaceNavProps) {
  
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces.length > 0 && onWorkspaceSelect) {
      onWorkspaceSelect('default');
    }
  }, [ selectedWorkspaceId, workspaces, onWorkspaceSelect ]);
  
  const handleWorkspaceClick = (workspaceId: string) => {
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspaceId);
    }
    onTabChange('active');
  };
  
  return (
    <nav className="mt-2 space-y-0.5">
      {workspaces.map((workspace) => {
        const isSelected = selectedWorkspaceId === workspace.id && activeTab === 'active';
        const formsCount = workspace.forms?.length || 0;
        const isDefault = workspace.id === 'default';
        
        const WorkspaceIcon = isDefault ? Home : Folder;
        
        return (
          <div key={workspace.id}>
            <button
              type="button"
              onClick={() => handleWorkspaceClick(workspace.id)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'font-normal text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <WorkspaceIcon className="h-4 w-4" />
                <span className="truncate">{workspace.name}</span>
              </div>
              {formsCount > 0 && (
                <span className="text-xs text-gray-500">{formsCount}</span>
              )}
            </button>
          </div>
        );
      })}
      
      <button
        type="button"
        onClick={() => onTabChange('archived')}
        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
          activeTab === 'archived'
            ? 'bg-gray-100 font-medium text-gray-900'
            : 'font-normal text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          <span>Archived</span>
        </div>
        {archivedCount > 0 && (
          <span className="text-xs text-gray-500">{archivedCount}</span>
        )}
      </button>
    </nav>
  );
}
