interface LeaveModalProps {
  isOpen: boolean;
  workspaceName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeaveModal({ isOpen, workspaceName, onClose, onConfirm }: LeaveModalProps) {
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
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Leave workspace</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to leave &quot;{workspaceName}&quot;? You will no longer have access to this workspace.
        </p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
