'use client';

import { EditFormNameModal } from '@/app/(wallet)/form/[id]/edit/components/EditFormNameModal';
import { useFormData } from '@/hooks';
import { ChevronDown, ChevronRight, LogOut, Send, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from 'stellar-wallet-kit';

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
  formId: string,
  activeTab: Tab,
  showPublishButton?: boolean,
}

export function FormEditNavigation({
                                     formId,
                                     activeTab,
                                     showPublishButton = false,
                                   }: FormEditNavigationProps) {
  const { formData, setFormData, save, isSaving, lastUpdate } = useFormData(formId);
  const [ isPublishing, setIsPublishing ] = useState(false);
  const [ isEditModalOpen, setIsEditModalOpen ] = useState(false);
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
  const { account, isConnected, disconnect } = useWallet();
  const router = useRouter();
  const [ open, setOpen ] = useState(false);
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
  
  const handlePublish = async () => {
    setIsPublishing(true);
    setFormData(prevState => ({ ...prevState, isActive: !formData.isActive }));
    await save();
    setIsPublishing(false);
  };
  
  const handleSaveFormTitle = async (newTitle: string) => {
    setFormData(prev => ({ ...prev, title: newTitle }));
    await save();
  };
  
  return (
    <nav className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <EditFormNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTitle={formData.title || ''}
        onSave={handleSaveFormTitle}
      />
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
          <div className="flex flex-col">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="font-semibold text-gray-900 transition-colors hover:text-primary text-left"
            >
              {formData.title || 'Untitled Form'}
            </button>
            {isSaving ? (
              <span className="text-xs text-gray-400 italic">guardando...</span>
            ) : lastUpdate ? (
              <span className="text-xs text-gray-400">
                Actualizado {new Date(lastUpdate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
        
        {/* Tabs - Centro */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => handleTabChange('content')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => handleTabChange('rewards')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => formData.isActive && handleTabChange('share')}
            disabled={!formData.isActive}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              !formData.isActive
                ? 'cursor-not-allowed text-gray-400'
                : activeTab === 'share'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Share
          </button>
          <button
            onClick={() => formData.isActive && handleTabChange('responses')}
            disabled={!formData.isActive}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              !formData.isActive
                ? 'cursor-not-allowed text-gray-400'
                : activeTab === 'responses'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Responses
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={showPublishButton ? '' : 'invisible'}>
            <button
              onClick={handlePublish}
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
