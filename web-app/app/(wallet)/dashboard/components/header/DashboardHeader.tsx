import { ViewControls } from './ViewControls';

interface DashboardHeaderProps {
  workspaceName: string;
  viewMode: 'list' | 'grid';
  sortBy: 'date' | 'name';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSortChange: (sort: 'date' | 'name') => void;
  onInviteClick: () => void;
  onRenameClick: () => void;
}

export function DashboardHeader({
  workspaceName,
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  onInviteClick,
  onRenameClick,
}: DashboardHeaderProps) {

  return (
    <div className="hidden lg:flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRenameClick}
          className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer"
        >
          {workspaceName}
        </button>

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
