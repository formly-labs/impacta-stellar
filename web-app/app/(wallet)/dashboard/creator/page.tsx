'use client';

import { FormCreateInput, FormResponse, FormUpdateInput } from '@/types';
import { Menu, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';

const handleSave = async (body: FormCreateInput): Promise<FormResponse> => {
  const response = await fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

const handleUpdate = async (formId: string, updatedData: FormUpdateInput) => {
  const response = await fetch(`/api/forms/${formId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  return response.json();
};

export default function WelcomeDashboard() {
  
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isSuccess, setIsSuccess ] = useState(false);
  const { account, isConnected } = useWallet();
  const router = useRouter();
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await handleSave({
        title: '',
        description: '',
        fields: [
          {
            type: 'text',
            label: 'name',
            placeholder: '',
            required: true,
          },
          {
            type: 'email',
            label: 'email',
            placeholder: '',
            required: true,
          },
        ],
        ownerAddress: account?.address ?? '',
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        router.push(`/dashboard/creator/${response.id}`);
        router.refresh(); // Para actualizar los datos en el servidor
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white font-sans">
      
      <nav className="p-6">
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
          <Menu className="w-8 h-8 text-slate-400 group-hover:text-white" />
          <span className="sr-only">Menú principal</span>
        </button>
      </nav>
      
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          BIENVENIDO
        </h1>
        
        <div className="w-full max-w-md">
          <button onClick={handleClick}>
            <div className="group relative flex items-center justify-between p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]">
              
              <span className="text-xl md:text-2xl font-medium text-slate-200 group-hover:text-white">
                Crea tu formulario ahora
              </span>
              
              <div className="bg-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/20">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              
              <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      
      </div>
      
      <div className="fixed bottom-10 right-10 opacity-20 hidden md:block">
        <p className="text-sm tracking-[0.5em] uppercase font-light text-slate-500">
          Stellar Network | FormPay v1.0
        </p>
      </div>
    </main>
  );
}
