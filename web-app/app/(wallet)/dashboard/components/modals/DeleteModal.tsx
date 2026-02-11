interface DeleteModalProps {
  isOpen: boolean;
  workspaceName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, workspaceName, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete workspace</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to permanently delete &quot;{workspaceName}&quot;? This action cannot be undone and all forms will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
