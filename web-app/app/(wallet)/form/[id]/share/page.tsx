'use client';

import { EditFormNameModal } from '@/app/(wallet)/form/[id]/edit/components/EditFormNameModal';
import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { FormResponse, FormUpdateInput } from '@/types';
import {
  Check,
  Code,
  Eye,
  Facebook,
  Grid,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MoreHorizontal,
  Settings,
  Share2,
  Twitter,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  const [ formData, setFormData ] = useState<FormUpdateInput>({
    title: '',
    description: '',
    fields: [],
    slug: '',
  });
  const [ isActive, setIsActive ] = useState(false);
  const [ loading, setLoading ] = useState(true);
  const [ copied, setCopied ] = useState(false);
  const [ isEditModalOpen, setIsEditModalOpen ] = useState(false);
  const [ shareTab, setShareTab ] = useState<'options' | 'advanced'>('options');
  
  const formUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/encuesta/${formData.slug}`;
  
  useEffect(() => {
    if (!formId) {
      router.push('/dashboard');
    }
  }, [ formId, router ]);
  
  // Redirigir si el formulario no está activo
  useEffect(() => {
    if (!loading && !isActive) {
      router.push(`/form/${formId}/edit`);
    }
  }, [ loading, isActive, formId, router ]);
  
  useEffect(() => {
    if (formId) {
      fetch(`/api/forms/${formId}`)
        .then(res => res.json())
        .then((data: FormResponse) => {
          setFormData({
            title: data.title,
            description: data.description || '',
            fields: data.fields,
            slug: data.slug || '',
          });
          setIsActive(data.isActive || false);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [ formId ]);
  
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
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) {
    return (
      <div className="flex h-full flex-col bg-white">
        <FormEditNavigation
          formTitle={formData.title || ''}
          activeTab="share"
          onTabChange={handleTabChange}
          onFormTitleClick={() => setIsEditModalOpen(true)}
          showPublishButton={false}
          isActive={isActive}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Navegación */}
      <FormEditNavigation
        formTitle={formData.title || ''}
        activeTab="share"
        onTabChange={handleTabChange}
        onFormTitleClick={() => setIsEditModalOpen(true)}
        showPublishButton={false}
        isActive={isActive}
      />
      
      {/* Modal para editar nombre */}
      <EditFormNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTitle={formData.title || ''}
        onSave={handleSaveFormTitle}
      />
      
      {/* Contenido principal con layout de tres columnas */}
      <div className="flex flex-1 gap-4 overflow-hidden bg-gray-50 p-4">
        {/* Sidebar izquierdo - opciones de compartir */}
        <aside className="flex w-56 shrink-0 flex-col">
          <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
                  <LinkIcon className="h-4 w-4" />
                  Share the link
                </button>
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  <Mail className="h-4 w-4" />
                  Embed in an email
                </button>
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  <Code className="h-4 w-4" />
                  Embed in a web page
                </button>
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  <Users className="h-4 w-4" />
                  Get targeted respondents
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Área central - Preview del formulario */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Barra superior con botones */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Copy link
                </>
              )}
            </button>
            <input
              type="text"
              value={formUrl}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            />
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              Customize
            </button>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-50">
              <Mail className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-50">
              <Grid className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-50">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          {/* Preview del formulario */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex h-full items-center justify-center p-8">
              {/* Simulación del formulario */}
              <div className="w-full max-w-2xl">
                <div className="mb-8">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-medium text-white">
                      1
                    </div>
                    <span className="text-sm text-gray-500">→</span>
                  </div>
                  <h2 className="mb-3 text-2xl font-medium text-gray-900">{formData.title || 'asdf'}</h2>
                  <input
                    type="text"
                    placeholder="name@example.com"
                    className="w-full border-b-2 border-gray-300 bg-transparent py-3 text-gray-600 placeholder-gray-400 focus:border-primary focus:outline-none"
                  />
                </div>
                <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white">
                  Submit
                </button>
                <p className="mt-4 text-xs text-gray-500">
                  Never submit passwords! · <span className="underline">Report abuse</span>
                </p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Sidebar derecho - Configuraciones */}
        <aside className="flex w-80 shrink-0 flex-col">
          <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setShareTab('options')}
                    className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      shareTab === 'options'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Share options
                  </button>
                  <button
                    onClick={() => setShareTab('advanced')}
                    className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      shareTab === 'advanced'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
              
              {/* Contenido del tab */}
              <div className="p-4">
                {shareTab === 'options' && (
                  <div className="space-y-6">
                    {/* Share in */}
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-gray-900">Share in:</h3>
                      <div className="flex gap-2">
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50">
                          <Facebook className="h-4 w-4" />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50">
                          <Linkedin className="h-4 w-4" />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50">
                          <Twitter className="h-4 w-4" />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Link settings */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">Link settings</h3>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-gray-900">Preview</h3>
                      <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
                        <div className="text-center">
                          <Grid className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                          <p className="text-xs font-medium text-gray-900">Formly</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Thumbnail */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">Thumbnail</h3>
                        <button className="text-xs text-gray-400">?</button>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                          Upload
                        </button>
                        <button className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                          <Settings className="mx-auto h-4 w-4" />
                          Design with Canva
                        </button>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title || 'My new form'}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <button className="text-xs text-gray-400">?</button>
                      </div>
                      <textarea
                        value={formData.description || 'Turn data collection into an experience with Formly. Create beautiful online forms, surveys, quizzes, and so much more. Try it for FREE.'}
                        readOnly
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                      />
                    </div>
                  </div>
                )}
                
                {shareTab === 'advanced' && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Configuración avanzada
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
