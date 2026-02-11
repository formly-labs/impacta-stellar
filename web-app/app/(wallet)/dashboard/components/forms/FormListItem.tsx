import { FormResponse } from '@/types';
import { Archive, ArchiveRestore, ChevronRight, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FormListItemProps {
  form: FormResponse;
  isArchived?: boolean;
  archivingId: string | null;
  onArchive: (formId: string, archive: boolean) => void;
}

export function FormListItem({ form, isArchived = false, archivingId, onArchive }: FormListItemProps) {
  const isLoading = archivingId === form.id;
  
  return (
    <div
      className={`group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm ${
        isArchived ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <Link
        href={`/dashboard/${form.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
          <FileText className={`h-4 w-4 ${isArchived ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${isArchived ? 'text-gray-600' : 'text-gray-900'}`}>
            {form.title}
          </p>
          <p className={`truncate text-xs ${isArchived ? 'text-gray-400' : 'text-gray-500'}`}>
            {form.description}
          </p>
        </div>
      </Link>
      
      <button
        type="button"
        onClick={() => onArchive(form.id, !isArchived)}
        disabled={isLoading}
        className={`shrink-0 transition-colors disabled:opacity-50 ${
          isArchived
            ? 'text-gray-400 hover:text-gray-900'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title={isArchived ? 'Restore' : 'Archive'}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isArchived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </button>
      
      {!isArchived && (
        <Link href={`/dashboard/creator/${form.id}`}>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        </Link>
      )}
    </div>
  );
}
