'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ConnectButton, useWallet } from 'stellar-wallet-kit';

export default function ConnectPage() {
  
  const { account, isConnected } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (isConnected) {
      const callbackUrl = searchParams.get('callbackUrl');
      
      const destination = callbackUrl ? decodeURIComponent(callbackUrl) : '/dashboard/creator';
      
      router.push(destination);
    }
  }, [ isConnected, router, searchParams ]);
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4">
      <div className="w-full max-auto max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Bienvenido a <span className="text-blue-500">Formly</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Conecta tu wallet de Stellar para empezar a crear o responder formularios.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4">
          {!isConnected ? (
            <div className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <ConnectButton />
            </div>
          ) : (
            <div className="text-center animate-pulse">
              <p className="text-green-400 text-sm font-medium">Conexión exitosa</p>
              <p className="text-slate-500 text-xs truncate max-w-[250px] mt-1">
                {account?.address}
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            ¿No tienes una wallet?
            <a
              href="https://www.stellar.org/lumens/wallets"
              target="_blank"
              className="text-blue-400 hover:underline ml-1"
            >
              Aprende cómo crear una
            </a>
          </p>
        </div>
      </div>
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>
    </main>
  );
}
