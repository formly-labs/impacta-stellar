import { Loader2 } from 'lucide-react';
import { FormResponse } from '@/types';
import { FormListItem } from './FormListItem';
import { FormCard } from './FormCard';
import { EmptyState } from './EmptyState';

interface FormListProps {
  forms: FormResponse[];
  loading: boolean;
  viewMode: 'list' | 'grid';
  archivingId: string | null;
  isArchived?: boolean;
  onArchive: (formId: string, archive: boolean) => void;
}

export function FormList({ 
  forms, 
  loading, 
  viewMode, 
  archivingId, 
  isArchived = false,
  onArchive 
}: FormListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
        <EmptyState type={isArchived ? 'no-archived' : 'no-forms'} />
      </div>
    );
  }

  return (
    <>
      {forms.map((form) =>
        viewMode === 'list' ? (
          <FormListItem
            key={form.id}
            form={form}
            isArchived={isArchived}
            archivingId={archivingId}
            onArchive={onArchive}
          />
        ) : (
          <FormCard
            key={form.id}
            form={form}
            isArchived={isArchived}
            archivingId={archivingId}
            onArchive={onArchive}
          />
        )
      )}
    </>
  );
}
