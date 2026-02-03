'use client';

import { FormResponse } from '@/types';
import { ArrowLeft, BarChart3, Coins, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormDetailsPage() {
  const { id } = useParams();
  const [ form, setForm ] = useState<FormResponse | null>(null);
  
  useEffect(() => {
    fetch(`/api/forms/${id}`).then(res => res.json()).then(setForm);
  }, [ id ]);
  
  if (!form) return <div className="min-h-screen bg-[#0f172a]" />;
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${form.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {form.isActive ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-black tracking-tight">{form.title}</h1>
          <p className="text-slate-400 mt-2">{form.description}</p>
        </div>
        
        {/* Grid de Acciones Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href={`/dashboard/creator/${id}/form`}
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
          >
            <Edit3 className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-bold text-xl">Editar Estructura</h3>
            <p className="text-sm text-slate-400 mt-1">Modifica las preguntas y campos del formulario.</p>
          </Link>
          
          <Link
            href={`/dashboard/creator/${id}/budget`}
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
          >
            <Coins className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="font-bold text-xl">Configurar Reward</h3>
            <p className="text-sm text-slate-400 mt-1">Gestiona el presupuesto de XLM para los usuarios.</p>
          </Link>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl opacity-50 cursor-not-allowed">
            <BarChart3 className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-bold text-xl">Estadísticas</h3>
            <p className="text-sm text-slate-400 mt-1">Mira quién y cómo han respondido (Próximamente).</p>
          </div>
        </div>
        
        {/* Mini Stats */}
        <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Respuestas</p>
            <p className="text-3xl font-mono mt-1">0</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Reward p/u</p>
            <p className="text-3xl font-mono mt-1">0.0 XLM</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Campos</p>
            <p className="text-3xl font-mono mt-1">{form.fields.length}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Vistas</p>
            <p className="text-3xl font-mono mt-1">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
