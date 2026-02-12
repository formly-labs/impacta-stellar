'use client';

import { useWallet } from 'stellar-wallet-kit';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, PropsWithChildren } from 'react';

export function WalletGuard({ children }: PropsWithChildren) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeño delay para que el wallet provider inicialice
    const timer = setTimeout(() => {
      setIsChecking(false);

      if (!isConnected) {
        // Guardar la ruta actual como query param para redirección
        const redirectUrl = encodeURIComponent(pathname || '/dashboard');
        router.push(`/login?redirectTo=${redirectUrl}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isConnected, router, pathname]);

  // Mostrar loading mientras verifica la conexión
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="text-sm text-gray-500">Verificando conexión...</p>
        </div>
      </div>
    );
  }

  // Si está conectado, mostrar el contenido
  if (isConnected) {
    return <>{children}</>;
  }

  // Si no está conectado, mostrar loading mientras redirige
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        <p className="text-sm text-gray-500">Redirigiendo...</p>
      </div>
    </div>
  );
}