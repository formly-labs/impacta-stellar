'use client';

import { AlertCircle, ArrowLeft, Info, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function BudgetPage() {
  const { id } = useParams();
  const [ totalBudget, setTotalBudget ] = useState(10);
  const [ rewardPerPerson, setRewardPerPerson ] = useState(0.5);
  
  const responsesPossible = Math.floor(totalBudget / rewardPerPerson);
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href={`/dashboard/creator/${id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Presupuesto del Formulario</h1>
        </header>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Presupuesto Total
                (XLM)</label>
              <div className="relative">
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-2xl font-mono outline-none focus:border-blue-500 transition-all"
                />
                <Wallet className="absolute right-4 top-4 text-slate-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Reward por cada respuesta
                (XLM)</label>
              <input
                type="number"
                step="0.1"
                value={rewardPerPerson}
                onChange={(e) => setRewardPerPerson(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-2xl font-mono outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Info className="text-blue-400 shrink-0 mt-1" />
              <div>
                <p className="text-blue-100 font-medium">Con este presupuesto, obtendrás aproximadamente:</p>
                <p className="text-4xl font-black text-white mt-2">{responsesPossible}
                  <span className="text-lg font-normal text-blue-300">respuestas verificadas</span>
                </p>
              </div>
            </div>
          </div>
          
          <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black text-xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95">
            <Zap className="w-6 h-6 fill-white" />
            DEPOSITAR XLM Y ACTIVAR
          </button>
          
          <p className="text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3" />
            Los fondos se mantendrán en un depósito seguro hasta que se completen las respuestas.
          </p>
        </div>
      </div>
    </div>
  );
}
