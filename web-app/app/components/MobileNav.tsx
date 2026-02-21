'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DarkModeToggle } from './DarkModeToggle';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-white/10"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay + drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl dark:bg-[#111827]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1 px-4 py-4">
              <a
                href="#features"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Productos
              </a>
              <a
                href="#blockchain"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Blockchain
              </a>
              <a
                href="#ai"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                AI Engine
              </a>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Precios
              </a>
            </nav>

            {/* Dark mode toggle */}
            <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/10">
              <DarkModeToggle />
              <span className="text-xs text-gray-500 dark:text-gray-400">Cambiar tema</span>
            </div>

            {/* Actions at bottom */}
            <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 px-5 py-5 dark:border-white/10">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
              >
                Registrarse
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
