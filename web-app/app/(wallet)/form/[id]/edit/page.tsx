'use client';

import { AIAssistantForm } from '@/app/(wallet)/form/[id]/edit/AIAssistant';
import { FieldInput, FormResponse, FormUpdateInput } from '@/types';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto corto' },
  { value: 'long_text', label: 'Texto largo' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'number', label: 'Número' },
  { value: 'radio', label: 'Opción única' },
  { value: 'checkbox', label: 'Opción múltiple' },
];

export default function CreateFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  const [ formData, setFormData ] = useState<FormUpdateInput>({
    title: '',
    description: '',
    fields: [],
  });
  const [ loading, setLoading ] = useState(!!formId);
  const [ saving, setSaving ] = useState(false);
  const [ selectedQuestionIndex, setSelectedQuestionIndex ] = useState<number | null>(null);
  
  console.log('page', { formData });
  useEffect(() => {
    if (!formId) {
      router.push('/dashboard');
    }
  }, [ formId, router ]);
  
  // Validar que selectedQuestionIndex sea válido
  useEffect(() => {
    const hasFields = formData.fields && formData.fields.length > 0;
    const isValidIndex = selectedQuestionIndex !== null &&
      formData.fields &&
      selectedQuestionIndex < formData.fields.length;
    
    // Si hay campos pero no hay selección válida, seleccionar el primero
    if (hasFields && !isValidIndex) {
      setSelectedQuestionIndex(0);
    }
    // Si no hay campos, limpiar la selección
    else if (!hasFields && selectedQuestionIndex !== null) {
      setSelectedQuestionIndex(null);
    }
  }, [ formData.fields, selectedQuestionIndex ]);
  
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
          // Seleccionar la primera pregunta si existe
          if (data.fields && data.fields.length > 0) {
            setSelectedQuestionIndex(0);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [ formId ]);
  
  const addField = () => {
    const newField: FieldInput = {
      type: 'text',
      label: `Pregunta ${(formData.fields?.length || 0) + 1}`,
      placeholder: '',
      required: false,
    };
    const newFields = [ ...(formData.fields || []), newField ];
    setFormData(prev => ({ ...prev, fields: newFields }));
    setSelectedQuestionIndex(newFields.length - 1);
  };
  
  const updateField = (index: number, updatedField: Partial<FieldInput>) => {
    const newFields = [ ...(formData.fields || []) ];
    newFields[index] = { ...newFields[index], ...updatedField };
    setFormData({ ...formData, fields: newFields });
  };
  
  const removeField = (index: number) => {
    const newFields = formData.fields?.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: newFields,
    });
    // Ajustar la selección
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(newFields && newFields.length > 0 ? 0 : null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    const url = `/api/forms/${formId}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
      });
      
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="text-sm text-gray-500">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  const selectedField = selectedQuestionIndex !== null && formData.fields ? formData.fields[selectedQuestionIndex] : null;
  
  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Lista de preguntas */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
            Nombre:
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Untitled Form"
            className="flex-1 border-none bg-transparent text-base font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
        
        <div className="border-b border-gray-200 p-3">
          <button
            onClick={addField}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nueva pregunta
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Preguntas
            </h3>
            <span className="text-xs font-medium text-gray-500">
              {formData.fields?.length || 0}
            </span>
          </div>
          
          <div className="space-y-1">
            {formData.fields?.map((field, index) => (
              <button
                key={index}
                onClick={() => setSelectedQuestionIndex(index)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedQuestionIndex === index
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{field.label || `Pregunta ${index + 1}`}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(index);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
      
      {/* Área principal */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header con botón guardar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 gap-4">
          {/* Propiedades a la izquierda */}
          {selectedField ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Tipo:
                </label>
                <select
                  value={selectedField.type}
                  onChange={(e) => updateField(selectedQuestionIndex!, { type: e.target.value as FieldInput['type'] })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedQuestionIndex!, { required: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="required" className="text-sm text-gray-700 whitespace-nowrap">
                  Campo requerido
                </label>
              </div>
            </div>
          ) : (
            <div />
          )}
          
          {/* Botón a la derecha */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Editor de pregunta */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedField ? (
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Pregunta */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Pregunta
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedQuestionIndex!, { label: e.target.value })}
                        placeholder="Escribe tu pregunta aquí"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Placeholder (opcional)
                      </label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedQuestionIndex!, { placeholder: e.target.value })}
                        placeholder="Texto de ejemplo para el usuario"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    {/* Opciones para radio y checkbox */}
                    {(selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Opciones
                        </label>
                        <div className="space-y-2">
                          {selectedField.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [ ...(selectedField.options || []) ];
                                  newOptions[optIndex] = e.target.value;
                                  updateField(selectedQuestionIndex!, { options: newOptions });
                                }}
                                placeholder={`Opción ${optIndex + 1}`}
                                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = selectedField.options?.filter((_, i) => i !== optIndex);
                                  updateField(selectedQuestionIndex!, { options: newOptions });
                                }}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [ ...(selectedField.options || []), '' ];
                              updateField(selectedQuestionIndex!, { options: newOptions });
                            }}
                            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                            Añadir opción
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No hay preguntas
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Crea tu primera pregunta para comenzar
                  </p>
                  <button
                    onClick={addField}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    Crear pregunta
                  </button>
                </div>
              </div>
            )}
          </div>
          <AIAssistantForm formData={formData} setFormData={setFormData} />
        </div>
      </main>
    </div>
  );
}
