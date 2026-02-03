'use client';

import { FieldInput, FormResponse, FormUpdateInput } from '@/types';
import { ArrowLeft, Hash, Loader2, Mail, Phone, Plus, Save, Trash2, Type } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  useEffect(() => {
    if (!formId) {
      router.push('/dashboard/creator');
    }
  }, [ formId, router ]);
  
  const [ formData, setFormData ] = useState<FormUpdateInput>({
    title: '',
    description: '',
    fields: [],
  });
  const [ loading, setLoading ] = useState(!!formId);
  const [ saving, setSaving ] = useState(false);
  
  useEffect(() => {
    if (formId) {
      fetch(`/api/forms/${formId}`)
        .then(res => res.json())
        .then((data: FormResponse) => {
          setFormData({
            title: data.title,
            description: data.description,
            fields: data.fields,
          });
          setLoading(false);
        });
    }
  }, [ formId ]);
  
  const addField = (type: FieldInput['type']) => {
    const newField: FieldInput = {
      type,
      label: `Nueva pregunta de ${type}`,
      placeholder: '',
      required: false,
    };
    setFormData(prev => ({ ...prev, fields: [ ...(prev.fields || []), newField ] }));
  };
  
  const updateField = (index: number, updatedField: Partial<FieldInput>) => {
    const newFields = [ ...(formData.fields || []) ];
    newFields[index] = { ...newFields[index], ...updatedField };
    setFormData({ ...formData, fields: newFields });
  };
  
  const removeField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields?.filter((_, i) => i !== index),
    });
  };
  
  const handleSave = async () => {
    setSaving(true);
    const method = formId ? 'PUT' : 'POST';
    const url = formId ? `/api/forms/${formId}` : '/api/api/forms';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;
  }
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/creator/${formId}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{formId ? 'Editar' : 'Nuevo'} Formulario</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {formId ? 'Actualizar' : 'Publicar'}
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Herramientas */}
        <aside className="w-80 border-r border-white/10 bg-slate-950/30 p-6 hidden lg:block">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Añadir Campo</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => addField('text')}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-500/10 transition-all text-sm group"
            >
              <Type className="w-4 h-4 text-slate-400 group-hover:text-blue-400" /> Texto
            </button>
            <button
              onClick={() => addField('email')}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-500/10 transition-all text-sm group"
            >
              <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-400" /> Email
            </button>
            <button
              onClick={() => addField('number')}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-500/10 transition-all text-sm group"
            >
              <Hash className="w-4 h-4 text-slate-400 group-hover:text-blue-400" /> Número
            </button>
          </div>
        </aside>
        
        <main className="flex-1 bg-slate-900/20 overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-2xl space-y-8 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm h-fit">
            
            {/* Header del Formulario */}
            <div className="space-y-4 border-b border-white/10 pb-8">
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del Formulario"
                className="bg-transparent text-4xl font-bold w-full outline-none text-white placeholder:text-slate-700"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción..."
                className="bg-transparent text-slate-400 w-full outline-none resize-none text-lg"
                rows={2}
              />
            </div>
            
            {/* Renderizado de Fields Dinámicos */}
            <div className="space-y-6">
              {formData.fields?.map((field, index) => (
                <div
                  key={index}
                  className="space-y-2 group relative bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <input
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="bg-transparent font-medium text-slate-200 outline-none border-b border-transparent focus:border-blue-500/50 w-full"
                    />
                    <button
                      onClick={() => removeField(index)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center bg-black/20 border border-white/10 rounded-xl p-3">
                    <input
                      disabled
                      placeholder={field.placeholder || `Ej: Ingrese su ${field.type}...`}
                      className="bg-transparent flex-1 outline-none text-slate-500 text-sm italic"
                    />
                    {field.type === 'email' && <Mail className="w-4 h-4 text-slate-600" />}
                    {field.type === 'phone' && <Phone className="w-4 h-4 text-slate-600" />}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => addField('text')}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Añadir campo de texto
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
