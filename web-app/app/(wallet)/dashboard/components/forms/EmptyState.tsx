import Link from 'next/link';
import { Plus, Archive } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-forms' | 'no-archived';
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === 'no-archived') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Archive className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-sm text-gray-500">No archived forms</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6">
        <svg className="h-32 w-32 text-gray-300" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1" />
          <path
            d="M70 80h60M70 100h60M70 120h40"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">There is not a form in sight</h3>
      <p className="mt-1 text-sm text-gray-500">Create your first form to get started</p>
      <Link
        href="/dashboard/questionnaires/new?step=theme"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
        Create a new form
      </Link>
    </div>
  );
}
