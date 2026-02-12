'use client';

import { useWallet } from 'stellar-wallet-kit';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { LogOut, Wallet, ChevronDown, ChevronRight, Send } from 'lucide-react';

function truncateAddress(address: string, start = 6, end = 4) {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function getInitials(address: string) {
  if (!address) return '?';
  return address.slice(1, 3).toUpperCase();
}

type Tab = 'content' | 'responses' | 'rewards' | 'share';

interface FormEditNavigationProps {
  formTitle: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onFormTitleClick: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  showPublishButton?: boolean;
  isActive?: boolean;
}

export function FormEditNavigation({ 
  formTitle, 
  activeTab, 
  onTabChange,
  onFormTitleClick,
  onPublish,
  isPublishing = false,
  showPublishButton = false,
  isActive = false
}: FormEditNavigationProps) {
  const { account, isConnected, disconnect } = useWallet();
  const router = useRouter();
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

  return (
    <nav className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs - Izquierda */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Forms
          </button>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <button
            onClick={onFormTitleClick}
            className="font-semibold text-gray-900 transition-colors hover:text-primary"
          >
            {formTitle || 'Untitled Form'}
          </button>
        </div>

        {/* Tabs - Centro */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => onTabChange('content')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => onTabChange('rewards')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => isActive && onTabChange('share')}
            disabled={!isActive}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              !isActive
                ? 'cursor-not-allowed text-gray-400'
                : activeTab === 'share'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Share
          </button>
          <button
            onClick={() => isActive && onTabChange('responses')}
            disabled={!isActive}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              !isActive
                ? 'cursor-not-allowed text-gray-400'
                : activeTab === 'responses'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Responses
          </button>
        </div>

        {/* Botón Publicar + Wallet - Derecha */}
        <div className="flex items-center gap-3">
          {/* Botón publicar - Siempre ocupa el espacio */}
          <div className={showPublishButton ? '' : 'invisible'}>
            <button
              onClick={onPublish}
              disabled={isPublishing || !showPublishButton}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {!isConnected ? (
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Iniciar sesión
            </button>
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
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Cuenta</p>
                    <p className="mt-1 truncate font-mono text-sm text-gray-900" title={account?.address}>
                      {account?.address}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push('/dashboard');
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Wallet className="h-4 w-4" />
                      Dashboard
                    </button>
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
    </nav>
  );
}
