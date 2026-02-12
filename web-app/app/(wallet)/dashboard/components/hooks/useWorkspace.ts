import { useState } from 'react';

export function useWorkspace() {
  const [workspaceName, setWorkspaceName] = useState('formly');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const openRenameModal = () => {
    setNewWorkspaceName(workspaceName);
    setRenameModalOpen(true);
  };

  const handleRename = () => {
    if (newWorkspaceName.trim()) {
      setWorkspaceName(newWorkspaceName.trim());
      setRenameModalOpen(false);
      setNewWorkspaceName('');
    }
  };

  return {
    workspaceName,
    renameModalOpen,
    leaveModalOpen,
    deleteModalOpen,
    newWorkspaceName,
    setWorkspaceName,
    setRenameModalOpen,
    setLeaveModalOpen,
    setDeleteModalOpen,
    setNewWorkspaceName,
    openRenameModal,
    handleRename,
  };
}
