import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { WorkspaceNav } from './WorkspaceNav';

interface DashboardSidebarProps {
  workspaceName: string;
  activeTab: 'active' | 'archived';
  formsCount: number;
  archivedCount: number;
  onTabChange: (tab: 'active' | 'archived') => void;
}

export function DashboardSidebar({ 
  workspaceName, 
  activeTab, 
  formsCount, 
  archivedCount, 
  onTabChange 
}: DashboardSidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-full flex-col overflow-y-auto p-4">
        {/* Create button */}
        <Link
          href="/form/sd/create"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create a new form
        </Link>

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
              className="text-gray-400 hover:text-gray-600"
              title="Add workspace"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <WorkspaceNav
            workspaceName={workspaceName}
            activeTab={activeTab}
            formsCount={formsCount}
            archivedCount={archivedCount}
            onTabChange={onTabChange}
          />
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
          <button
            type="button"
            className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
          >
            Increase response limit
          </button>
        </div>
      </div>
    </aside>
  );
}
