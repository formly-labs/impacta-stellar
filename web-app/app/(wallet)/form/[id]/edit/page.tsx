'use client';

import { AIAssistantForm } from '@/app/(wallet)/form/[id]/edit/AIAssistant';
import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { PublishSuccessModal } from '@/app/(wallet)/form/[id]/edit/components/PublishSuccessModal';
import { QuestionTypeSelector } from '@/app/(wallet)/form/[id]/edit/components/QuestionTypeSelector';
import { RewardsModal } from '@/app/(wallet)/form/[id]/edit/components/RewardsModal';
import { useFormData } from '@/hooks';
import { FieldInput } from '@/types';
import {
  AlignLeft,
  Check,
  CheckSquare,
  Circle,
  Copy,
  FileText,
  Hash,
  List,
  Lock,
  Mail,
  Monitor,
  MoreVertical,
  Phone,
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const FIELD_TYPES = [
  {
    value: 'text',
    label: 'Pregunta corta',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: AlignLeft,
    bgColor: 'bg-blue-100',
  },
  {
    value: 'long_text',
    label: 'Pregunta larga',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileText,
    bgColor: 'bg-blue-100',
  },
  {
    value: 'email',
    label: 'Email',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: Mail,
    bgColor: 'bg-pink-100',
  },
  {
    value: 'phone',
    label: 'Teléfono',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: Phone,
    bgColor: 'bg-pink-100',
  },
  {
    value: 'number',
    label: 'Número',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Hash,
    bgColor: 'bg-yellow-100',
  },
  {
    value: 'radio',
    label: 'Opción única',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Circle,
    bgColor: 'bg-purple-100',
  },
  {
    value: 'checkbox',
    label: 'Opción múltiple',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: CheckSquare,
    bgColor: 'bg-purple-100',
  },
];

export default function CreateFormPage() {
  
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { formData, setFormData, isLoading } = useFormData(formId);
  const [ selectedQuestionIndex, setSelectedQuestionIndex ] = useState<number | null>(null);
  const [ viewMode, setViewMode ] = useState<'desktop' | 'mobile'>('desktop');
  const [ showActionsMenu, setShowActionsMenu ] = useState(false);
  const [ showRewardsModal, setShowRewardsModal ] = useState(false);
  const [ showSuccessModal, setShowSuccessModal ] = useState(false);
  const [ selectedScreen, setSelectedScreen ] = useState<'question' | 'welcome' | 'ending'>('question');
  const [ showMobileSidebar, setShowMobileSidebar ] = useState(false);
  const [ showMobileAI, setShowMobileAI ] = useState(false);
  
  useEffect(() => {
    if (!formId) {
      router.push('/dashboard');
    }
  }, [ formId, router ]);
  
  useEffect(() => {
    const hasFields = formData.fields && formData.fields.length > 0;
    const isValidIndex = selectedQuestionIndex !== null &&
      formData.fields &&
      selectedQuestionIndex < formData.fields.length;
    
    if (hasFields && !isValidIndex) {
      setSelectedQuestionIndex(0);
    } else if (!hasFields && selectedQuestionIndex !== null) {
      setSelectedQuestionIndex(null);
    }
  }, [ formData.fields, selectedQuestionIndex ]);
  
  const addField = async () => {
    const newField: FieldInput = {
      type: 'text',
      label: `Pregunta ${(formData.fields?.length || 0) + 1}`,
      placeholder: '',
      required: false,
    };
    const newFields = [ ...(formData.fields || []), newField ];
    setFormData(prev => ({ ...prev, fields: newFields }));
    setSelectedQuestionIndex(newFields.length - 1);
    setSelectedScreen('question');
    // await save();
  };
  
  const updateField = async (index: number, updatedField: Partial<FieldInput>) => {
    const newFields = [ ...(formData.fields || []) ];
    newFields[index] = { ...newFields[index], ...updatedField };
    setFormData({ ...formData, fields: newFields });
    // await save();
  };
  
  const removeField = async (index: number) => {
    const newFields = formData.fields?.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: newFields,
    });
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(newFields && newFields.length > 0 ? 0 : null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
    // await save();
  };
  
  const duplicateField = async (index: number) => {
    const fieldToDuplicate = formData.fields?.[index];
    if (!fieldToDuplicate) return;
    
    const duplicatedField: FieldInput = {
      ...fieldToDuplicate,
      label: `${fieldToDuplicate.label} (copia)`,
    };
    
    const newFields = [ ...(formData.fields || []) ];
    newFields.splice(index + 1, 0, duplicatedField);
    setFormData({ ...formData, fields: newFields });
    setSelectedQuestionIndex(index + 1);
    // await save();
  };
  
  const handleRewardsYes = () => {
    setShowRewardsModal(false);
    router.push(`/form/${formId}/rewards`);
  };
  
  const handleRewardsNo = () => {
    setShowRewardsModal(false);
    setShowSuccessModal(true);
  };
  
  const handleSuccessComplete = () => {
    router.push(`/form/${formId}/share`);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="text-sm text-gray-500">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  const isReadOnly = !!formData.isActive;
  const selectedField = selectedQuestionIndex !== null && formData.fields ? formData.fields[selectedQuestionIndex] : null;
  
  return (
    <div className="flex h-full flex-col bg-white">
      <FormEditNavigation
        formId={formId}
        activeTab="content"
      />
      
      {isReadOnly && (
        <div className="shrink-0 flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Formulario publicado.</strong> No podés modificar el contenido mientras el formulario está activo.
            Desactivalo primero desde la navegación.
          </p>
        </div>
      )}
      
      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        onYes={handleRewardsYes}
        onNo={handleRewardsNo}
      />
      
      <PublishSuccessModal
        isOpen={showSuccessModal}
        onComplete={handleSuccessComplete}
      />
      
      <div className={`flex flex-1 gap-0 overflow-hidden p-0 lg:gap-4 lg:p-4 ${isReadOnly ? 'pointer-events-none select-none opacity-50' : ''}`}>
        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSidebar(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col gap-3 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Preguntas</h3>
                <button onClick={() => setShowMobileSidebar(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Mobile sidebar content — cloned below */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <div className="flex-1 space-y-2">
                  {formData.fields?.map((field, index) => {
                    const fieldType = FIELD_TYPES.find((t) => t.value === field.type);
                    const FieldIcon = fieldType?.icon || AlignLeft;
                    return (
                      <button
                        key={index}
                        onClick={() => { setSelectedQuestionIndex(index); setSelectedScreen('question'); setShowMobileSidebar(false); }}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${selectedQuestionIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 ${fieldType?.bgColor || 'bg-gray-100'}`}>
                          <FieldIcon className="h-3.5 w-3.5 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
                        </div>
                        <p className="min-w-0 truncate text-sm font-medium text-gray-900">{field.label || `Pregunta ${index + 1}`}</p>
                      </button>
                    );
                  })}
                  {(!formData.fields || formData.fields.length === 0) && (
                    <p className="py-8 text-center text-sm text-gray-400">No hay preguntas</p>
                  )}
                </div>
                <button onClick={() => { setSelectedScreen('welcome'); setShowMobileSidebar(false); }}
                  className={`flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors ${selectedScreen === 'welcome' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                  welcome screen <Plus className="h-4 w-4 text-gray-400" />
                </button>
                <button onClick={() => { setSelectedScreen('ending'); setShowMobileSidebar(false); }}
                  className={`flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors ${selectedScreen === 'ending' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                  ending screen <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Mobile AI overlay */}
        {showMobileAI && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileAI(false)} />
            <div className="absolute bottom-0 left-0 right-0 flex h-[75dvh] flex-col rounded-t-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <span className="text-sm font-bold text-gray-900">AI Assistant</span>
                <button onClick={() => setShowMobileAI(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAssistantForm formData={formData} setFormData={setFormData} />
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
          {/* Caja 1: Lista de preguntas */}
          <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Lista de preguntas */}
              <div className="space-y-2">
                {formData.fields?.map((field, index) => {
                  const fieldType = FIELD_TYPES.find((t) => t.value === field.type);
                  const FieldIcon = fieldType?.icon || AlignLeft;
                  
                  return (
                    <div key={index} className="relative">
                      <div
                        className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all overflow-hidden ${
                          selectedQuestionIndex === index
                            ? 'bg-gray-100'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedQuestionIndex(index);
                            setSelectedScreen('question');
                            setShowActionsMenu(false);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          {/* Icono + Número juntos en el mismo contenedor */}
                          <div className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 ${fieldType?.bgColor || 'bg-gray-100'}`}>
                            <FieldIcon className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          
                          {/* Título de la pregunta */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {field.label || `Pregunta ${index + 1}`}
                            </p>
                          </div>
                        </button>
                        
                        {/* Icono de 3 puntos - Solo cuando está seleccionada */}
                        {selectedQuestionIndex === index && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActionsMenu(!showActionsMenu);
                            }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Mini modal de acciones - Solo cuando está seleccionada */}
                      {selectedQuestionIndex === index && showActionsMenu && (
                        <>
                          {/* Overlay para cerrar */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowActionsMenu(false)}
                          />
                          
                          {/* Menú de acciones */}
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateField(index);
                                  setShowActionsMenu(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeField(index);
                                  setShowActionsMenu(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Mensaje cuando no hay preguntas */}
              {(!formData.fields || formData.fields.length === 0) && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">No hay preguntas</p>
                  <p className="mt-1 text-xs text-gray-400">Crea tu primera pregunta</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Caja 2: Welcome Screen */}
          <div className="shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setSelectedScreen('welcome')}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                selectedScreen === 'welcome' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium text-gray-700">welcome screen</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          {/* Caja 3: Ending Screen */}
          <div className="shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setSelectedScreen('ending')}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                selectedScreen === 'ending' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium text-gray-700">ending screen</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </aside>
        
        {/* Área central - Toolbar + Contenido */}
        <main className="flex flex-1 flex-col gap-0 overflow-hidden lg:gap-4">
          {/* Toolbar superior con controles */}
          <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 lg:gap-3 lg:rounded-lg lg:border lg:px-6 lg:py-3 lg:shadow-sm">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              title="Ver preguntas"
            >
              <List className="h-5 w-5" />
            </button>

            <button
              onClick={addField}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir pregunta</span>
              <span className="sm:hidden">Añadir</span>
            </button>
            
            {selectedScreen === 'question' && selectedField && (
              <>
                <div className="hidden h-6 w-px bg-gray-300 sm:block" />
                
                <QuestionTypeSelector
                  value={selectedField.type}
                  onChange={(type) => updateField(selectedQuestionIndex!, { type })}
                />
                
                <label className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-2 cursor-pointer transition-all hover:bg-gray-50 sm:gap-2 sm:px-3">
                  <span className="text-xs font-medium uppercase text-gray-500 sm:text-sm sm:normal-case sm:text-gray-700">required</span>
                  <button
                    type="button"
                    onClick={() => updateField(selectedQuestionIndex!, { required: !selectedField.required })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors sm:h-6 sm:w-11 ${
                      selectedField.required ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform sm:h-4 sm:w-4 ${
                        selectedField.required ? 'translate-x-[18px] sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                
                <button
                  onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                  className="hidden items-center justify-center rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 sm:flex"
                  title={viewMode === 'desktop' ? 'Cambiar a vista mobile' : 'Cambiar a vista desktop'}
                >
                  {viewMode === 'desktop' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                </button>
              </>
            )}
            
            {(selectedScreen === 'welcome' || selectedScreen === 'ending') && (
              <button
                onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                className="ml-auto hidden items-center justify-center rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 sm:flex"
              >
                {viewMode === 'desktop' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </button>
            )}
          </div>
          
          {/* Editor de pregunta o screens */}
          <div className="flex-1 overflow-hidden bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-sm">
            {/* Welcome Screen */}
            {selectedScreen === 'welcome' && (
              <div
                className={`h-full flex items-center justify-center transition-all duration-300 ${
                  viewMode === 'mobile' ? 'bg-gradient-to-br from-gray-50 to-gray-100 p-8' : 'bg-white'
                }`}
              >
                <div
                  className={`h-full overflow-hidden transition-all duration-300 ${
                    viewMode === 'mobile'
                      ? 'w-[375px] h-[667px] rounded-3xl shadow-2xl bg-white'
                      : 'w-full'
                  }`}
                >
                  <div className={`h-full flex flex-col justify-center ${viewMode === 'mobile' ? 'p-8' : 'p-16'}`}>
                    <div className="max-w-2xl w-full">
                      {/* Título editable - estilo typeform */}
                      <input
                        type="text"
                        value={formData.welcome?.title || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          welcome: {
                            ...prev.welcome,
                            title: e.target.value,
                            description: prev.welcome?.description || '',
                          },
                        }))}
                        placeholder="Say hi! Recall information with @"
                        className={`w-full mb-4 border-none bg-transparent px-0 py-0 font-normal italic text-gray-900 placeholder-gray-400 focus:outline-none focus:not-italic ${
                          viewMode === 'mobile' ? 'text-xl' : 'text-3xl'
                        }`}
                      />
                      
                      {/* Descripción editable */}
                      <input
                        type="text"
                        value={formData.welcome?.description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          welcome: { title: prev.welcome?.title || '', description: e.target.value },
                        }))}
                        placeholder="Description (optional)"
                        className={`w-full mb-12 border-none bg-transparent px-0 py-0 font-normal italic text-gray-500 placeholder-gray-400 focus:outline-none ${
                          viewMode === 'mobile' ? 'text-sm' : 'text-base'
                        }`}
                      />
                      
                      {/* Botón Start */}
                      <div className="flex items-center gap-3 mb-4">
                        <button
                          className={`rounded-lg bg-primary px-6 py-3 font-medium text-white ${
                            viewMode === 'mobile' ? 'text-sm' : 'text-base'
                          }`}
                        >
                          Start
                        </button>
                        <span className="text-sm text-gray-400">
                          press <span className="font-semibold">Enter ↵</span>
                        </span>
                      </div>
                      
                      {/* Tiempo estimado */}
                      <p className="text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeWidth="2" d="M12 6v6l4 2" />
                          </svg>
                          Takes {formData.fields?.length || 0} minutes
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ending Screen */}
            {selectedScreen === 'ending' && (
              <div
                className={`h-full flex items-center justify-center transition-all duration-300 ${
                  viewMode === 'mobile' ? 'bg-gradient-to-br from-gray-50 to-gray-100 p-8' : 'bg-white'
                }`}
              >
                <div
                  className={`h-full overflow-hidden transition-all duration-300 ${
                    viewMode === 'mobile'
                      ? 'w-[375px] h-[667px] rounded-3xl shadow-2xl bg-white'
                      : 'w-full'
                  }`}
                >
                  <div className={`h-full flex flex-col justify-center items-center text-center ${viewMode === 'mobile' ? 'p-8' : 'p-16'}`}>
                    <div className="max-w-2xl w-full">
                      {/* Icono de éxito */}
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      
                      {/* Título editable */}
                      <input
                        type="text"
                        value={formData.ending?.title || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          ending: { title: e.target.value, description: prev.ending?.description || '' },
                        }))}
                        placeholder="¡Gracias!"
                        className={`w-full mb-6 rounded-lg border-2 border-transparent bg-transparent px-3 py-2 font-bold text-gray-900 placeholder-gray-400 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none text-center ${
                          viewMode === 'mobile' ? 'text-2xl' : 'text-4xl'
                        }`}
                      />
                      
                      {/* Descripción editable */}
                      <textarea
                        value={formData.ending?.description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          ending: { title: prev.ending?.title || '', description: e.target.value },
                        }))}
                        placeholder="Tus respuestas han sido registradas exitosamente."
                        rows={2}
                        className={`w-full mb-8 rounded-lg border-2 border-transparent bg-transparent px-3 py-2 font-normal text-gray-600 placeholder-gray-400 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none resize-none text-center ${
                          viewMode === 'mobile' ? 'text-base' : 'text-xl'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Question Editor */}
            {selectedScreen === 'question' && selectedField && (
              <div
                className={`h-full flex items-center justify-center transition-all duration-300 ${viewMode === 'mobile' ? 'bg-gradient-to-br from-gray-50 to-gray-100 p-8' : 'bg-white'
                }`}
              >
                {/* Container del contenido */}
                <div
                  className={`h-full overflow-hidden transition-all duration-300 ${viewMode === 'mobile'
                    ? 'w-[375px] h-[667px] rounded-3xl shadow-2xl bg-white'
                    : 'w-full'
                  }`}
                >
                  <div
                    className={`h-full overflow-y-auto flex flex-col justify-center ${viewMode === 'mobile' ? 'p-8' : 'p-16'
                    }`}
                  >
                    {/* Número de pregunta */}
                    <div className={viewMode === 'mobile' ? 'mb-3' : 'mb-4'}>
                      <span
                        className={`font-normal text-primary ${viewMode === 'mobile' ? 'text-lg' : 'text-2xl'
                        }`}
                      >
                        {(selectedQuestionIndex || 0) + 1}
                        <span className="ml-2">→</span>
                      </span>
                    </div>
                    
                    {/* Pregunta - Editable */}
                    <div className={viewMode === 'mobile' ? 'mb-2' : 'mb-3'}>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedQuestionIndex!, { label: e.target.value })}
                        placeholder="Your question here. Recall information with @"
                        className={`w-full border-none bg-transparent font-normal italic text-gray-900 placeholder-gray-400 focus:outline-none focus:not-italic ${viewMode === 'mobile' ? 'text-lg' : 'text-2xl'
                        }`}
                      />
                    </div>
                    
                    {/* Descripción opcional */}
                    <div className={viewMode === 'mobile' ? 'mb-8' : 'mb-10'}>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedQuestionIndex!, { placeholder: e.target.value })}
                        placeholder="Description (optional)"
                        className={`w-full border-none bg-transparent font-normal italic text-gray-500 placeholder-gray-400 focus:outline-none ${viewMode === 'mobile' ? 'text-sm' : 'text-base'
                        }`}
                      />
                    </div>
                    
                    {/* Vista previa de respuesta según tipo */}
                    <div className={viewMode === 'mobile' ? 'space-y-3' : 'space-y-4'}>
                      {/* Vista previa según tipo de campo */}
                      {selectedField.type === 'text' && (
                        <input
                          type="text"
                          placeholder="Type your answer here..."
                          disabled
                          className={`w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-primary/40 focus:border-primary focus:outline-none ${viewMode === 'mobile' ? 'pb-2 text-base' : 'pb-3 text-xl'
                          }`}
                        />
                      )}
                      
                      {selectedField.type === 'long_text' && (
                        <div>
                          <textarea
                            placeholder="Type your answer here..."
                            rows={viewMode === 'mobile' ? 3 : 4}
                            disabled
                            className={`w-full resize-none border-b border-gray-300 bg-transparent text-gray-900 placeholder-primary/40 focus:border-primary focus:outline-none ${viewMode === 'mobile' ? 'pb-2 text-base' : 'pb-3 text-xl'
                            }`}
                          />
                          <p
                            className={`mt-2 text-primary ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'
                            }`}
                          >
                            <span className="font-semibold">Shift ⏎</span>
                            + <span className="font-semibold">Enter ↵</span> to make a line break
                          </p>
                        </div>
                      )}
                      
                      {selectedField.type === 'email' && (
                        <input
                          type="email"
                          placeholder="name@example.com"
                          disabled
                          className={`w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-primary/40 focus:border-primary focus:outline-none ${viewMode === 'mobile' ? 'pb-2 text-base' : 'pb-3 text-xl'
                          }`}
                        />
                      )}
                      
                      {selectedField.type === 'number' && (
                        <input
                          type="number"
                          placeholder="123"
                          disabled
                          className={`w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-primary/40 focus:border-primary focus:outline-none ${viewMode === 'mobile' ? 'pb-2 text-base' : 'pb-3 text-xl'
                          }`}
                        />
                      )}
                      
                      {selectedField.type === 'phone' && (
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          disabled
                          className={`w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-primary/40 focus:border-primary focus:outline-none ${viewMode === 'mobile' ? 'pb-2 text-base' : 'pb-3 text-xl'
                          }`}
                        />
                      )}
                      
                      
                      {/* Opciones para radio y checkbox */}
                      {(selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                        <div className={viewMode === 'mobile' ? 'space-y-2' : 'space-y-3'}>
                          {selectedField.options?.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`group flex items-center rounded-lg bg-gray-50/50 border border-gray-200 transition-all hover:border-primary/50 hover:bg-primary/5 ${viewMode === 'mobile' ? 'gap-3 p-3' : 'gap-4 p-4'
                              }`}
                            >
                              {/* Letra en cuadro azul */}
                              <div
                                className={`flex items-center justify-center rounded bg-primary/10 border border-primary/20 font-semibold text-primary ${viewMode === 'mobile' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [ ...(selectedField.options || []) ];
                                  newOptions[optIndex] = e.target.value;
                                  updateField(selectedQuestionIndex!, { options: newOptions });
                                }}
                                placeholder={`Opción ${optIndex + 1}`}
                                className={`flex-1 border-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none ${viewMode === 'mobile' ? 'text-base' : 'text-lg'
                                }`}
                              />
                              <button
                                onClick={() => {
                                  const newOptions = selectedField.options?.filter((_, i) => i !== optIndex);
                                  updateField(selectedQuestionIndex!, { options: newOptions });
                                }}
                                className="opacity-0 rounded p-1 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                              >
                                <Trash2 className={viewMode === 'mobile' ? 'h-4 w-4' : 'h-4 w-4'} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [ ...(selectedField.options || []), '' ];
                              updateField(selectedQuestionIndex!, { options: newOptions });
                            }}
                            className={`text-primary hover:underline font-normal ${viewMode === 'mobile' ? 'text-sm' : 'text-base'
                            }`}
                          >
                            Add choice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mensaje cuando no hay pregunta seleccionada */}
            {selectedScreen === 'question' && !selectedField && (
              <div className="flex h-full w-full items-center justify-center bg-white rounded-lg">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No hay pregunta seleccionada
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Selecciona una pregunta del panel izquierdo
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* AI Assistant — desktop only */}
        <div className="hidden w-80 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block">
          <AIAssistantForm formData={formData} setFormData={setFormData} />
        </div>
      </div>

      {/* Mobile floating buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3 lg:hidden">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-50"
          title="Ver preguntas"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowMobileAI(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-600"
          title="AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
