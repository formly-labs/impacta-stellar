'use client';

import { FormResponse } from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Edit,
  Link2,
  Moon,
  ShieldOff,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/encuesta/${id}`
      : '';

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then(setForm);
  }, [id]);

  const handleDeactivate = async () => {
    if (!form) return;
    setIsDeactivating(true);
    try {
      await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      setForm((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
    } catch {
      // silently fail
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6">
        {/* ── Header ── */}
        <header className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">
                  {form.title}
                </h1>
                <p className="text-xs text-gray-500">Vista general del formulario</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/form/${id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => router.push(`/form/${id}/answers`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary-500 bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-600"
              >
                Ver Respuestas
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                  form.isActive
                    ? 'bg-[#f87171] text-white hover:bg-[#ef4444]'
                    : 'bg-success text-white hover:bg-[#059669]'
                }`}
              >
                <ShieldOff className="h-3.5 w-3.5" />
                {form.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>

          {/* ── Share Link ── */}
          <div className="border-t border-gray-100 bg-primary-50 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500">
                <Link2 className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                  Enlace público
                </p>
                <p className="truncate text-xs text-gray-700 font-medium">{shareLink}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  copied
                    ? 'bg-success text-white'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Total respuestas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-primary-500">0</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Preguntas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-primary-500">
              {form.fields?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Reward / resp.
            </p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">
              {form.rewardPerGoodAnswer ?? 0}
              <span className="ml-1 text-xs font-medium text-warning">XLM</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Estado
            </p>
            <p className={`mt-1.5 text-base font-bold ${form.isActive ? 'text-success' : 'text-destructive'}`}>
              {form.isActive ? 'Activa' : 'Inactiva'}
            </p>
          </div>
        </div>

        {/* ── Description ── */}
        {form.description && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Descripción
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">{form.description}</p>
            </div>
          </div>
        )}

        {/* ── Questions List ── */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Preguntas de la encuesta
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {form.fields && form.fields.length > 0 ? (
              form.fields.map((field, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-primary-50 transition-colors">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{field.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500 capitalize">
                      {field.type.replace('_', ' ')}
                    </p>
                    {field.placeholder && (
                      <p className="mt-1 text-xs text-gray-400 italic">
                        Placeholder: {field.placeholder}
                      </p>
                    )}
                    {field.options && field.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {field.options.map((option, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {field.required && (
                    <span className="text-xs font-medium text-red-500">
                      Requerido
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-center text-sm text-gray-400">
                No hay preguntas definidas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Moon icon */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 hover:shadow-xl hover:scale-105"
        aria-label="Cambiar tema"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
}
