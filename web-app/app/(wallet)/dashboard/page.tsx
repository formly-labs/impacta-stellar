'use client';

import { FormResponse } from '@/types';
import { ChevronRight, Coins, FileText, Loader2, Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';

export default function CreatorDashboard() {
  const { account } = useWallet();
  const [ forms, setForms ] = useState<FormResponse[]>([]);
  const [ loading, setLoading ] = useState(true);
  
  useEffect(() => {
    if (account?.address) {
      fetch(`/api/forms?address=${account.address}`)
        .then(res => res.json())
        .then(data => {
          setForms(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [ account?.address ]);
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Mis Formularios</h1>
            <p className="text-slate-400 mt-2">Gestiona tus encuestas e incentivos de Stellar.</p>
          </div>
          <Link
            href="/dashboard/creator"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-5 h-5" /> Crear Nuevo
          </Link>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 text-slate-400 mb-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Total Formularios</span>
            </div>
            <p className="text-3xl font-mono">{forms.length}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 text-blue-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Respuestas Totales</span>
            </div>
            <p className="text-3xl font-mono">0</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-4 text-yellow-500 mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Fondos en Circulación</span>
            </div>
            <p className="text-3xl font-mono">0.00 XLM</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500">No has creado ningún formulario todavía.</p>
            </div>
          ) : (
            forms.map((form) => (
              <div
                key={form.id}
                className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all gap-6"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{form.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-1">{form.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Respuestas</p>
                    <p className="text-lg font-mono">0</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Estado</p>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md font-bold">ACTIVO</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/creator/${form.id}`}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
