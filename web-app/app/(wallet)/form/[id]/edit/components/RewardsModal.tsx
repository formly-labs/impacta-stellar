'use client';

import { X, Gift } from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

export function RewardsModal({ isOpen, onClose, onYes, onNo }: RewardsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icono */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Contenido */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            ¿Agregar recompensas?
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Motiva a tus usuarios a completar el formulario ofreciendo recompensas. Puedes configurarlas ahora o más tarde.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onNo}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            No, gracias
          </button>
          <button
            onClick={onYes}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Sí, agregar
          </button>
        </div>
      </div>
    </div>
  );
}
