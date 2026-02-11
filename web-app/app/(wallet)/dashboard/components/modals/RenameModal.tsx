interface RenameModalProps {
  isOpen: boolean;
  workspaceName: string;
  onClose: () => void;
  onRename: (name: string) => void;
}

export function RenameModal({ isOpen, workspaceName, onClose, onRename }: RenameModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('workspaceName') as string;
    if (name.trim()) {
      onRename(name.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rename workspace</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="workspaceName"
            defaultValue={workspaceName}
            placeholder="Workspace name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
