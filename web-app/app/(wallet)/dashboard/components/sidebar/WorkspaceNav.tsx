import { Archive, Folder } from 'lucide-react';

interface WorkspaceNavProps {
  workspaceName: string;
  activeTab: 'active' | 'archived';
  formsCount: number;
  archivedCount: number;
  onTabChange: (tab: 'active' | 'archived') => void;
}

export function WorkspaceNav({ 
  workspaceName, 
  activeTab, 
  formsCount, 
  archivedCount, 
  onTabChange 
}: WorkspaceNavProps) {
  return (
    <nav className="mt-2 space-y-0.5">
      <button
        type="button"
        onClick={() => onTabChange('active')}
        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
          activeTab === 'active'
            ? 'bg-gray-100 font-medium text-gray-900'
            : 'font-normal text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span>{workspaceName}</span>
        </div>
        {formsCount > 0 && (
          <span className="text-xs text-gray-500">{formsCount}</span>
        )}
      </button>
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
