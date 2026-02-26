'use client';

import { usePollar } from '@pollar/react';
import { Camera, ChevronDown, Loader2, LogOut, Menu, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DashboardSidebarV2 } from '../components/sidebar/DashboardSidebarV2';

type Profile = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

const ROLES = ['Administrador', 'Editor', 'Lector'] as const;

export default function ConfiguracionPage() {
  const { walletAddress, logout } = usePollar();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Administrador');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?address=${encodeURIComponent(walletAddress)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const first = data?.firstName ?? '';
        const last = data?.lastName ?? '';
        setFullName([first, last].filter(Boolean).join(' ').trim());
        setEmail(data?.email ?? '');
      } else {
        setProfile(null);
        setFullName('');
        setEmail('');
      }
    } catch {
      setProfile(null);
      setFullName('');
      setEmail('');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!walletAddress) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ') ?? '';
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email.trim() || undefined,
          phone: profile?.phone ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Error al guardar');
      }
      setSaveSuccess(true);
      await fetchProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleCreateForm = async () => {
    if (!walletAddress) return;
    setIsCreatingForm(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: walletAddress,
          title: 'Untitled Form',
          description: '',
          fields: [],
        }),
      });
      if (!res.ok) throw new Error('Error al crear');
      const { id } = await res.json();
      setMobileSidebarOpen(false);
      router.push(`/form/${id}/edit`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const now = new Date();
  const lastSessionLabel = now.toLocaleDateString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  const lastSessionFormatted = lastSessionLabel.charAt(0).toUpperCase() + lastSessionLabel.slice(1);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}
      <div className={`${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden lg:block'}`}>
        <DashboardSidebarV2
          activeTab="active"
          archivedCount={0}
          onTabChange={() => {}}
          onCreateForm={handleCreateForm}
          isCreatingForm={isCreatingForm}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isMobile={mobileSidebarOpen}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra tu información personal y preferencias de cuenta.
            </p>

            {loading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {/* Profile photo */}
                <div className="flex flex-col items-start gap-3">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-gray-600 hover:bg-gray-300"
                      aria-label="Editar foto"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm font-medium text-primary hover:text-primary-600"
                  >
                    EDITAR FOTO
                  </Link>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Ej. Claudio Castro"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="admin@formly.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Rol de usuario
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  {saveSuccess && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                      Cambios guardados correctamente.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 self-start text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Section 2: Información de Cuenta (right sidebar) */}
      <aside className="hidden w-80 shrink-0 border-l border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Información de cuenta
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Estado de cuenta
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Activa</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Última sesión
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{lastSessionFormatted}</p>
              <p className="mt-0.5 text-xs text-gray-500">IP: 192.168.1.104</p>
            </div>

            <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    Tu cuenta está protegida con autenticación básica. Activa 2FA para mayor seguridad.
                  </p>
                  <Link
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary-600"
                  >
                    CONFIGURAR 2FA
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-auto pt-6 text-xs text-gray-400">VERSIÓN 2.4.0</p>
        </div>
      </aside>
    </div>
  );
}
