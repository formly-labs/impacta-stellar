'use client';

import { EditFormNameModal } from '@/app/(wallet)/form/[id]/edit/components/EditFormNameModal';
import { useFormData } from '@/hooks';
import { usePollar } from '@pollar/react';
import { Check, ChevronDown, ChevronRight, Copy, LogOut, Send, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function truncateAddress(address: string, start = 6, end = 4) {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function getInitials(address: string) {
  if (!address) return '?';
  return address.slice(1, 3).toUpperCase();
}

type Tab = 'responses' | 'rewards' | 'share';

interface FormEditNavigationProps {
  formId: string,
  activeTab: Tab,
  showPublishButton?: boolean,
}

export function FormEditNavigation({
                                     formId,
                                     activeTab,
                                   }: FormEditNavigationProps) {
  const { formData, setFormData, isSaving, lastUpdate, refetch } = useFormData(formId);
  const [ isPublishing, setIsPublishing ] = useState(false);
  const [ isEditModalOpen, setIsEditModalOpen ] = useState(false);
  const [ copied, setCopied ] = useState(false);
  const handleTabChange = (tab: 'responses' | 'rewards' | 'share') => {
    if (tab === 'responses') {
      router.push(`/form/${formId}/answers`);
    } else if (tab === 'rewards') {
      router.push(`/form/${formId}/rewards`);
    } else {
      router.push(`/form/${formId}/share`);
    }
  };
  const { walletAddress, logout } = usePollar();
  const isConnected = !!walletAddress;
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
    await logout();
    router.push('/');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setFormData(prevState => ({ ...prevState, isActive: true }));
    // await save();
    await refetch();
    setIsPublishing(false);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/f/${formData.slug}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFormTitle = async (newTitle: string) => {
    setFormData(prev => ({ ...prev, title: newTitle }));
  };

  return (
    <nav className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <EditFormNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTitle={formData.title || ''}
        onSave={handleSaveFormTitle}
      />
      {/* Top row: breadcrumbs + actions */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:h-16">
        {/* Breadcrumbs - Izquierda */}
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="hidden shrink-0 font-medium text-gray-500 transition-colors hover:text-gray-900 sm:block"
          >
            Forms
          </button>
          <ChevronRight className="hidden h-4 w-4 shrink-0 text-gray-300 sm:block" />
          <div className="flex min-w-0 flex-col">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="truncate text-left font-semibold text-gray-900 transition-colors hover:text-primary"
            >
              {formData.title || 'Untitled Form'}
            </button>
            {isSaving ? (
              <span className="text-xs text-gray-400 italic">guardando...</span>
            ) : lastUpdate ? (
              <span className="hidden text-xs text-gray-400 sm:block">
                Actualizado {new Date(lastUpdate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>

        {/* Tabs - Centro (desktop only, moves to second row on mobile) */}
        <div className="hidden items-center gap-1 rounded-lg bg-gray-100 p-1 md:flex">
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
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {formData.isActive ? (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 sm:gap-2 sm:px-5 sm:text-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          )}

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
                  {getInitials(walletAddress ?? '')}
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 sm:block">
                  {walletAddress ? truncateAddress(walletAddress, 6, 4) : 'Usuario'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Cuenta</p>
                    <p className="mt-1 truncate font-mono text-sm text-gray-900" title={walletAddress}>
                      {walletAddress}
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

      {/* Mobile tabs - second row */}
      <div className="flex overflow-x-auto border-t border-gray-100 px-4 md:hidden">
        {([ 'responses', 'rewards', 'share' ] as const).map((tab) => {
          const disabled = (tab === 'share' || tab === 'responses') && !formData.isActive;
          return (
            <button
              key={tab}
              onClick={() => !disabled && handleTabChange(tab)}
              disabled={disabled}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium capitalize transition-all ${
                disabled
                  ? 'cursor-not-allowed border-transparent text-gray-300'
                  : activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
