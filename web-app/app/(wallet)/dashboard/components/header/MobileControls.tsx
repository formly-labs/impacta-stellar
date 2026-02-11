import Link from 'next/link';
import { Plus, Grid3x3, List } from 'lucide-react';

interface MobileControlsProps {
  workspaceName: string;
  activeTab: 'active' | 'archived';
  viewMode: 'list' | 'grid';
  onTabChange: (tab: 'active' | 'archived') => void;
  onViewModeToggle: () => void;
  onInviteClick: () => void;
}

export function MobileControls({ 
  workspaceName, 
  activeTab, 
  viewMode, 
  onTabChange, 
  onViewModeToggle,
  onInviteClick 
}: MobileControlsProps) {
  return (
    <>
      {/* Mobile header */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h1 className="text-lg font-semibold text-gray-900">{workspaceName}</h1>
        <Link
          href="/dashboard/questionnaires/new?step=theme"
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => onTabChange('active')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => onTabChange('archived')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'archived'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Archived
        </button>
        <button
          type="button"
          onClick={onViewModeToggle}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2"
        >
          {viewMode === 'list' ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onInviteClick}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2"
          title="Invite"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
      </div>
    </>
  );
}
