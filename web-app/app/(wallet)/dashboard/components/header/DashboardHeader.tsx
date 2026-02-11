import { useRef, useEffect } from 'react';
import { ViewControls } from './ViewControls';

interface DashboardHeaderProps {
  workspaceName: string;
  viewMode: 'list' | 'grid';
  sortBy: 'date' | 'name';
  workspaceMenuOpen: boolean;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSortChange: (sort: 'date' | 'name') => void;
  onInviteClick: () => void;
  onWorkspaceMenuToggle: () => void;
  onRenameClick: () => void;
  onLeaveClick: () => void;
  onDeleteClick: () => void;
  setWorkspaceMenuOpen: (open: boolean) => void;
}

export function DashboardHeader({
  workspaceName,
  viewMode,
  sortBy,
  workspaceMenuOpen,
  onViewModeChange,
  onSortChange,
  onInviteClick,
  onWorkspaceMenuToggle,
  onRenameClick,
  onLeaveClick,
  onDeleteClick,
  setWorkspaceMenuOpen,
}: DashboardHeaderProps) {
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [setWorkspaceMenuOpen]);

  return (
    <div className="hidden lg:flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center gap-1" ref={workspaceMenuRef}>
          <button
            type="button"
            onClick={onWorkspaceMenuToggle}
            className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {workspaceName}
          </button>
          <button
            type="button"
            onClick={onWorkspaceMenuToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="6" r="1" />
              <circle cx="12" cy="18" r="1" />
            </svg>
          </button>
          {workspaceMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
              <button
                type="button"
                onClick={onRenameClick}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={onLeaveClick}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Leave
              </button>
              <button
                type="button"
                onClick={onDeleteClick}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onInviteClick}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite
        </button>
      </div>

      <ViewControls
        viewMode={viewMode}
        sortBy={sortBy}
        onViewModeChange={onViewModeChange}
        onSortChange={onSortChange}
      />
    </div>
  );
}
