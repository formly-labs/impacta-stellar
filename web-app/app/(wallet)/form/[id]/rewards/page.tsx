'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { EditFormNameModal } from '@/app/(wallet)/form/[id]/edit/components/EditFormNameModal';
import { useEffect, useState } from 'react';
import { FormResponse, FormUpdateInput } from '@/types';

export default function RewardsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  const [formData, setFormData] = useState<FormUpdateInput>({
    title: '',
    description: '',
    fields: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!formId) {
      router.push('/dashboard');
    }
  }, [formId, router]);

  useEffect(() => {
    if (formId) {
      fetch(`/api/forms/${formId}`)
        .then(res => res.json())
        .then((data: FormResponse) => {
          setFormData({
            title: data.title,
            description: data.description || '',
            fields: data.fields,
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [formId]);

  const handleSaveFormTitle = (newTitle: string) => {
    setFormData(prev => ({ ...prev, title: newTitle }));
  };

  const handleTabChange = (tab: 'content' | 'responses' | 'rewards' | 'share') => {
    if (tab === 'content') {
      router.push(`/form/${formId}/edit`);
    } else if (tab === 'responses') {
      router.push(`/form/${formId}/answers`);
    } else if (tab === 'rewards') {
      router.push(`/form/${formId}/rewards`);
    } else {
      router.push(`/form/${formId}/share`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <FormEditNavigation
          formTitle={formData.title}
          activeTab="rewards"
          onTabChange={handleTabChange}
          onFormTitleClick={() => setIsEditModalOpen(true)}
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
      {/* Navegación */}
      <FormEditNavigation
        formTitle={formData.title}
        activeTab="rewards"
        onTabChange={handleTabChange}
        onFormTitleClick={() => setIsEditModalOpen(true)}
        showPublishButton={false}
      />

      {/* Modal para editar nombre */}
      <EditFormNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTitle={formData.title}
        onSave={handleSaveFormTitle}
      />

      {/* Contenido de Rewards con mismo layout */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">rewards</h1>
            <p className="mt-2 text-gray-500">Configuración de recompensas próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
