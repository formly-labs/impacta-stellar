'use client';

import { FormResponse } from '@/types';
import { isOnboardingCompleted } from '@/lib/onboardingStorage';
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Search,
  Grid3x3,
  List,
  Folder,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useWallet } from 'stellar-wallet-kit';

type Tab = 'active' | 'archived';
type ViewMode = 'list' | 'grid';

// Demo data shown when no real forms exist
const DEMO_FORMS = [
  { id: 'demo-1', title: 'Encuesta de Satisfacción 2024', updatedLabel: 'Actualizado hace 2 horas', responses: 0, isActive: true },
  { id: 'demo-2', title: 'Feedback de Producto Alpha', updatedLabel: 'Actualizado ayer', responses: 124, isActive: true },
  { id: 'demo-3', title: 'Registro de Evento Stellar', updatedLabel: 'Actualizado el 15 Oct', responses: 56, isActive: false },
  { id: 'demo-4', title: 'Test de UX Mobile', updatedLabel: 'Actualizado el 10 Oct', responses: 0, isActive: true },
];

export default function CreatorDashboard() {
  const { account } = useWallet();
  const router = useRouter();
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [archivedForms, setArchivedForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<Tab>('active');
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [linkCopied, setLinkCopied] = useState(false);
  const [invitedPeople, setInvitedPeople] = useState<Array<{ email: string; role: 'editor' | 'viewer' }>>([]);
  const [workspaceName, setWorkspaceName] = useState('formly');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isOnboardingCompleted()) {
      router.replace('/dashboard/onboarding?step=details');
    }
  }, [router]);

  // Close workspace menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleAddPerson = () => {
    if (inviteEmail.trim() && !invitedPeople.find(p => p.email === inviteEmail.trim())) {
      setInvitedPeople([...invitedPeople, { email: inviteEmail.trim(), role: 'editor' }]);
      setInviteEmail('');
    }
  };

  const handleRemovePerson = (email: string) => {
    setInvitedPeople(invitedPeople.filter(p => p.email !== email));
  };

  const handleChangeRole = (email: string, role: 'editor' | 'viewer') => {
    setInvitedPeople(invitedPeople.map(p => p.email === email ? { ...p, role } : p));
  };

  const handleRename = () => {
    if (newWorkspaceName.trim()) {
      setWorkspaceName(newWorkspaceName.trim());
      setRenameModalOpen(false);
      setNewWorkspaceName('');
      setWorkspaceMenuOpen(false);
    }
  };

  const handleLeaveConfirm = () => {
    setLeaveModalOpen(false);
    setWorkspaceMenuOpen(false);
    // Aquí iría la lógica para salir del workspace
    router.push('/dashboard');
  };

  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    setWorkspaceMenuOpen(false);
    // Aquí iría la lógica para eliminar el workspace
    router.push('/dashboard');
  };

  // Fetch active forms
  const fetchForms = useCallback(() => {
    if (!account?.address) return;
    fetch(`/api/forms?address=${account.address}`)
      .then(res => res.json())
      .then(data => {
        setForms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [account?.address]);

  // Fetch archived forms
  const fetchArchived = useCallback(() => {
    if (!account?.address) return;
    setLoadingArchived(true);
    fetch(`/api/forms?address=${account.address}&archived=true`)
      .then(res => res.json())
      .then(data => {
        setArchivedForms(Array.isArray(data) ? data : []);
        setLoadingArchived(false);
      })
      .catch(() => setLoadingArchived(false));
  }, [account?.address]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Fetch archived when switching to that tab
  useEffect(() => {
    if (tab === 'archived') {
      fetchArchived();
    }
  }, [tab, fetchArchived]);

  const handleArchive = async (formId: string, archive: boolean) => {
    setArchivingId(formId);
    try {
      const res = await fetch(`/api/forms/${formId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: archive }),
      });
      if (res.ok) {
        if (archive) {
          // Move from active → archived
          const moved = forms.find(f => f.id === formId);
          setForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setArchivedForms(prev => [moved, ...prev]);
        } else {
          // Move from archived → active
          const moved = archivedForms.find(f => f.id === formId);
          setArchivedForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setForms(prev => [moved, ...prev]);
        }
      }
    } catch {
      // silently fail
    } finally {
      setArchivingId(null);
    }
  };

  // Use demo data when no real forms
  const showDemo = !loading && forms.length === 0 && tab === 'active';
  const totalForms = showDemo ? 12 : forms.length;

  const filteredDemo = DEMO_FORMS.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredForms = forms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredArchived = archivedForms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Create button */}
          <Link
            href="/dashboard/questionnaires/new?step=theme"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create a new form
          </Link>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          </div>

          {/* Workspace */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-semibold text-gray-500">
                Workspaces
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                title="Add workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-2 space-y-0.5">
              <button
                type="button"
                onClick={() => setTab('active')}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${tab === 'active'
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'font-normal text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{workspaceName}</span>
                </div>
                {forms.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {forms.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('archived')}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${tab === 'archived'
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'font-normal text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span>Archived</span>
                </div>
                {archivedForms.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {archivedForms.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Stats en la parte inferior */}
          <div className="mt-auto space-y-3 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs font-semibold text-gray-700">Responses collected</p>
              <p className="mt-0.5 text-sm text-gray-900">
                <span className="font-semibold">0</span>
                <span className="text-gray-500"> / 100</span>
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
            >
              Increase response limit
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {workspaceName}
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="6" r="1" />
                    <circle cx="12" cy="18" r="1" />
                  </svg>
                </button>
                {workspaceMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setNewWorkspaceName(workspaceName);
                        setRenameModalOpen(true);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLeaveModalOpen(true);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModalOpen(true);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-50"
              >
                <option value="date">Last updated</option>
                <option value="name">Date created</option>
              </select>
              <div className="flex rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1.5 transition-colors ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1.5 transition-colors ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form list */}
          <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}`}>
            {/* ── Active tab ── */}
            {tab === 'active' && (
              <>
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : showDemo ? (
                  filteredDemo.map((form) => (
                    viewMode === 'list' ? (
                      <div
                        key={form.id}
                        className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{form.title}</p>
                          <p className="text-xs text-gray-500">{form.updatedLabel}</p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-sm text-gray-900">{form.responses} responses</p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      </div>
                    ) : (
                      <div
                        key={form.id}
                        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="6" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="18" r="1.5" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3">
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{form.title}</h3>
                          <p className="mt-1 text-xs text-gray-500">{form.updatedLabel}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-600">{form.responses} responses</p>
                        </div>
                      </div>
                    )
                  ))
                ) : filteredForms.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-24 ${viewMode === 'grid' ? 'col-span-full' : ''}`}>
                    <div className="mb-6">
                      <svg className="h-32 w-32 text-gray-300" viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1" />
                        <path d="M70 80h60M70 100h60M70 120h40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">There s not a form in sight</h3>
                    <p className="mt-1 text-sm text-gray-500">Create your first form to get started</p>
                    <Link
                      href="/dashboard/questionnaires/new?step=theme"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                      Create a new form
                    </Link>
                  </div>
                ) : (
                  filteredForms.map((form) => (
                    viewMode === 'list' ? (
                      <div
                        key={form.id}
                        className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm"
                      >
                        <Link
                          href={`/dashboard/creator/${form.id}`}
                          className="flex min-w-0 flex-1 items-center gap-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{form.title}</p>
                            <p className="truncate text-xs text-gray-500">{form.description}</p>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleArchive(form.id, true)}
                          disabled={archivingId === form.id}
                          className="shrink-0 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                          title="Archive"
                        >
                          {archivingId === form.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>

                        <Link href={`/dashboard/creator/${form.id}`}>
                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                        </Link>
                      </div>
                    ) : (
                      <div
                        key={form.id}
                        className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleArchive(form.id, true)}
                            disabled={archivingId === form.id}
                            className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                            title="Archive"
                          >
                            {archivingId === form.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Link href={`/dashboard/creator/${form.id}`} className="mt-3 block">
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{form.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{form.description}</p>
                        </Link>
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-600">0 responses</p>
                        </div>
                      </div>
                    )
                  ))
                )}
              </>
            )}

            {/* ── Archived tab ── */}
            {tab === 'archived' && (
              <>
                {loadingArchived ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredArchived.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-24 ${viewMode === 'grid' ? 'col-span-full' : ''}`}>
                    <Archive className="h-16 w-16 text-gray-300" />
                    <p className="mt-4 text-sm text-gray-500">No archived forms</p>
                  </div>
                ) : (
                  filteredArchived.map((form) => (
                    viewMode === 'list' ? (
                      <div
                        key={form.id}
                        className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 opacity-60 transition-all hover:opacity-100 hover:shadow-sm"
                      >
                        <Link
                          href={`/dashboard/creator/${form.id}`}
                          className="flex min-w-0 flex-1 items-center gap-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-600">{form.title}</p>
                            <p className="truncate text-xs text-gray-400">{form.description}</p>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleArchive(form.id, false)}
                          disabled={archivingId === form.id}
                          className="shrink-0 text-gray-400 transition-colors hover:text-gray-900 disabled:opacity-50"
                          title="Restore"
                        >
                          {archivingId === form.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArchiveRestore className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        key={form.id}
                        className="group rounded-lg border border-gray-200 bg-white p-4 opacity-60 transition-all hover:opacity-100 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleArchive(form.id, false)}
                            disabled={archivingId === form.id}
                            className="text-gray-400 transition-colors hover:text-gray-900 disabled:opacity-50"
                            title="Restore"
                          >
                            {archivingId === form.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArchiveRestore className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Link href={`/dashboard/creator/${form.id}`} className="mt-3 block">
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-600">{form.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-400">{form.description}</p>
                        </Link>
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-400">Archived</p>
                        </div>
                      </div>
                    )
                  ))
                )}
            </>
          )}
        </div>
        </div>
      </main>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setInviteModalOpen(false);
            setInviteEmail('');
            setInvitedPeople([]);
          }}
        >
          <div 
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Share &quot;{workspaceName}&quot;</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                  title="Help"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                  title="Settings"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Add people input */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPerson();
                      }
                    }}
                    placeholder="Add people, groups, spaces, and calendar events"
                    className="w-full rounded-lg border-2 border-blue-500 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* People with access */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">People with access</h3>
                  <div className="flex items-center gap-2">
                    <button className="rounded p-1 hover:bg-gray-100">
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="rounded p-1 hover:bg-gray-100">
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Current user (owner) */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                    {account?.address ? account.address.slice(1, 3).toUpperCase() : 'YO'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">You</p>
                    <p className="text-xs text-gray-500 truncate">{account?.address || 'owner@formly.io'}</p>
                  </div>
                  <span className="text-sm text-gray-500">Owner</span>
                </div>

                {/* Invited people */}
                {invitedPeople.map((person) => (
                  <div key={person.email} className="flex items-center gap-3 py-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-700">
                      {person.email.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{person.email}</p>
                      <p className="text-xs text-gray-500">Invited</p>
                    </div>
                    <select
                      value={person.role}
                      onChange={(e) => handleChangeRole(person.email, e.target.value as 'editor' | 'viewer')}
                      className="text-sm text-gray-700 outline-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person.email)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* General access */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">General access</h3>
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <select className="w-full text-sm font-medium text-gray-900 outline-none bg-transparent">
                      <option>Anyone with the link</option>
                      <option>Restricted</option>
                    </select>
                    <p className="text-xs text-gray-500">Anyone on the internet with the link can view</p>
                  </div>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="text-sm text-gray-700 outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 p-6">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  linkCopied
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {linkCopied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Link copied
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteModalOpen(false);
                  setInviteEmail('');
                  setInvitedPeople([]);
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setRenameModalOpen(false);
            setNewWorkspaceName('');
          }}
        >
          <div 
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rename workspace</h2>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
              placeholder="Workspace name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRenameModalOpen(false);
                  setNewWorkspaceName('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRename}
                disabled={!newWorkspaceName.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {leaveModalOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLeaveModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Leave workspace</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to leave &quot;{workspaceName}&quot;? You will no longer have access to this workspace.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveConfirm}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete workspace</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete &quot;{workspaceName}&quot;? This action cannot be undone and all forms will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
