'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DarkModeToggle } from './DarkModeToggle';

const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#why-stellar', label: 'Stellar' },
  { href: '#features', label: 'Features' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const close = () => setOpen(false);

  const drawer = (
    <div
      className="fixed inset-0 md:hidden"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={close}
        aria-hidden="true"
      />

      <div
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-[320px] flex-col bg-white shadow-2xl dark:bg-[#0b1121]"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Menu
          </span>
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-gray-400">Theme</span>
          <DarkModeToggle />
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-5 py-5 dark:border-white/10">
          <Link
            href="/login"
            onClick={close}
            className="w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
          >
            Get started
          </Link>
          <Link
            href="/login"
            onClick={close}
            className="w-full rounded-full border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-white/10"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && open && createPortal(drawer, document.body)}
    </>
  );
}
