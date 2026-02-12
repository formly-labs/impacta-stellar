import { FormResponse } from '@/types';
import { Archive, ArchiveRestore, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FormCardProps {
  form: FormResponse;
  isArchived?: boolean;
  archivingId: string | null;
  onArchive: (formId: string, archive: boolean) => void;
}

export function FormCard({ form, isArchived = false, archivingId, onArchive }: FormCardProps) {
  const isLoading = archivingId === form.id;
  
  return (
    <div
      className={`group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md ${
        isArchived ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <FileText className={`h-5 w-5 ${isArchived ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
        <button
          type="button"
          onClick={() => onArchive(form.id, !isArchived)}
          disabled={isLoading}
          className={`transition-colors disabled:opacity-50 ${
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
      </div>
      <Link href={`/form/${form.id}/edit`} className="mt-3 block">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`line-clamp-2 text-sm font-medium ${isArchived ? 'text-gray-600' : 'text-gray-900'}`}>
            {form.title}
          </h3>
          {!isArchived && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              form.isActive 
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {form.isActive ? 'Activo' : 'Inactivo'}
            </span>
          )}
        </div>
        <p className={`mt-1 line-clamp-2 text-xs ${isArchived ? 'text-gray-400' : 'text-gray-500'}`}>
          {form.description}
        </p>
      </Link>
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className={`text-xs ${isArchived ? 'text-gray-400' : 'text-gray-600'}`}>
          {isArchived ? 'Archived' : '0 responses'}
        </p>
      </div>
    </div>
  );
}
