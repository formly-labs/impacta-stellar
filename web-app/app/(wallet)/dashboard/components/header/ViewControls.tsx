import { Grid3x3, List } from 'lucide-react';

interface ViewControlsProps {
  viewMode: 'list' | 'grid';
  sortBy: 'date' | 'name';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSortChange: (sort: 'date' | 'name') => void;
}

export function ViewControls({ viewMode, sortBy, onViewModeChange, onSortChange }: ViewControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'date' | 'name')}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-50"
      >
        <option value="date">Last updated</option>
        <option value="name">Date created</option>
      </select>
      <div className="flex rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`px-2 py-1.5 transition-colors ${
            viewMode === 'list'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title="List view"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`px-2 py-1.5 transition-colors ${
            viewMode === 'grid'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title="Grid view"
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
