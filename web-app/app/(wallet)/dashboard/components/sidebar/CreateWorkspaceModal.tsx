'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerAddress: string;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
  ownerAddress,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [linkAccess, setLinkAccess] = useState<'RESTRICTED' | 'ANYONE_WITH_LINK'>('RESTRICTED');
  const [linkPermission, setLinkPermission] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('El nombre del workspace es obligatorio');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          ownerAddress,
          linkAccess,
          linkPermission,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el workspace');
      }

      // Limpiar formulario
      setName('');
      setDescription('');
      setLinkAccess('RESTRICTED');
      setLinkPermission('VIEWER');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Error al crear el workspace. Por favor intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setDescription('');
      setLinkAccess('RESTRICTED');
      setLinkPermission('VIEWER');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear nuevo workspace
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi Workspace"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isCreating}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del workspace..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isCreating}
              />
            </div>

            {/* Link Access */}
            <div>
              <label htmlFor="linkAccess" className="block text-sm font-medium text-gray-700">
                Acceso por link
              </label>
              <select
                id="linkAccess"
                value={linkAccess}
                onChange={(e) => setLinkAccess(e.target.value as 'RESTRICTED' | 'ANYONE_WITH_LINK')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isCreating}
              >
                <option value="RESTRICTED">Restringido (solo miembros)</option>
                <option value="ANYONE_WITH_LINK">Cualquiera con el link</option>
              </select>
            </div>

            {/* Link Permission */}
            {linkAccess === 'ANYONE_WITH_LINK' && (
              <div>
                <label htmlFor="linkPermission" className="block text-sm font-medium text-gray-700">
                  Permiso por link
                </label>
                <select
                  id="linkPermission"
                  value={linkPermission}
                  onChange={(e) => setLinkPermission(e.target.value as 'VIEWER' | 'EDITOR')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isCreating}
                >
                  <option value="VIEWER">Viewer (solo lectura)</option>
                  <option value="EDITOR">Editor (puede editar)</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}