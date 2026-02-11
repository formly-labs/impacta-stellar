import { useState } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  workspaceName: string;
  accountAddress?: string;
  onClose: () => void;
}

export function InviteModal({ isOpen, workspaceName, accountAddress, onClose }: InviteModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [linkCopied, setLinkCopied] = useState(false);
  const [invitedPeople, setInvitedPeople] = useState<Array<{ email: string; role: 'editor' | 'viewer' }>>([]);

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

  const handleClose = () => {
    setInviteEmail('');
    setInvitedPeople([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
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
        <div className="p-4 sm:p-6 space-y-4">
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
                {accountAddress ? accountAddress.slice(1, 3).toUpperCase() : 'YO'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">You</p>
                <p className="text-xs text-gray-500 truncate">{accountAddress || 'owner@formly.io'}</p>
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-200 p-4 sm:p-6">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
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
            onClick={handleClose}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:order-last"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
