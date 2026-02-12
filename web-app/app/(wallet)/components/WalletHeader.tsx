'use client';

import { useWallet } from 'stellar-wallet-kit';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { LogOut, Wallet, ChevronDown } from 'lucide-react';
import Image from 'next/image';

function truncateAddress(address: string, start = 6, end = 4) {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function getInitials(address: string) {
  if (!address) return '?';
  return address.slice(1, 3).toUpperCase();
}

export function WalletHeader() {
  const { account, isConnected, disconnect } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await disconnect();
    router.push('/');
  };

  // No mostrar header en login (login está fuera de (wallet), pero por si acaso)
  if (pathname === '/login') return null;
  
  // No mostrar header en las páginas de formulario con navegación propia
  if (pathname?.includes('/form/') && (pathname?.includes('/edit') || pathname?.includes('/rewards') || pathname?.includes('/share') || pathname?.includes('/answers'))) return null;

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image 
            src="/logo.png" 
            alt="Formly" 
            width={28} 
            height={28}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold text-gray-900">
            Formly
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Iniciar sesión
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-expanded={open}
                aria-haspopup="true"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {getInitials(account?.address ?? '')}
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 sm:block">
                  {account?.address ? truncateAddress(account.address, 6, 4) : 'Usuario'}
                </span>
                <ChevronDown 
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Cuenta</p>
                    <p className="mt-1 truncate font-mono text-sm text-gray-900" title={account?.address}>
                      {account?.address}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Wallet className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
