import { useState } from 'react';

export function useWorkspace() {
  const [workspaceName, setWorkspaceName] = useState('formly');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const openRenameModal = () => {
    setNewWorkspaceName(workspaceName);
    setRenameModalOpen(true);
    setWorkspaceMenuOpen(false);
  };

  const handleRename = () => {
    if (newWorkspaceName.trim()) {
      setWorkspaceName(newWorkspaceName.trim());
      setRenameModalOpen(false);
      setNewWorkspaceName('');
      setWorkspaceMenuOpen(false);
    }
  };

  return {
    workspaceName,
    workspaceMenuOpen,
    renameModalOpen,
    leaveModalOpen,
    deleteModalOpen,
    newWorkspaceName,
    setWorkspaceName,
    setWorkspaceMenuOpen,
    setRenameModalOpen,
    setLeaveModalOpen,
    setDeleteModalOpen,
    setNewWorkspaceName,
    openRenameModal,
    handleRename,
  };
}
