'use client';

import { Menu, Search } from 'lucide-react';

interface DashboardHeaderV2Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeToggle: () => void;
  onMenuClick?: () => void;
}

export function DashboardHeaderV2({
  searchQuery,
  onSearchChange,
  onMenuClick,
}: DashboardHeaderV2Props) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar formularios..."
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
        />
      </div>
    </header>
  );
}
