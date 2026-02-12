'use client';

import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { useFormData } from '@/hooks';
import { ArrowRight, Rocket } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RewardsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  const { formData, isLoading } = useFormData(formId);
  
  useEffect(() => {
    if (!params.id) {
      router.push('/dashboard');
    }
  }, [ params.id, router ]);
  
  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <FormEditNavigation
          formId={formId}
          activeTab="rewards"
          showPublishButton={false}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-sm text-gray-500">Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col bg-white">
      <FormEditNavigation
        formId={formId}
        activeTab="rewards"
        showPublishButton={false}
      />
      
      <div className="flex flex-1 gap-4 overflow-hidden bg-gray-50 p-4">
        <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="max-w-md text-center px-6 py-12">
            {/* Logo o icono */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            
            {/* Título */}
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              ¡Próximamente!
            </h2>
            
            {/* Descripción */}
            <p className="mb-8 text-base text-gray-600 leading-relaxed">
              Aún estamos trabajando en la funcionalidad de recompensas.
              Pronto podrás configurar incentivos increíbles para tus usuarios.
            </p>
            
            {/* Botón continuar */}
            <button
              onClick={() => router.push(`/form/${formData.id}/share`)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90"
            >
              Continuar
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
