'use client';

import { FormResponse } from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Link2,
  Moon,
  Printer,
  Search,
  ShieldOff,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* ────────────────────────────────────────────────────────────
   Demo responses (until real response model exists)
   ──────────────────────────────────────────────────────────── */
const DEMO_RESPONSES = [
  {
    id: 'r1',
    respondent: { name: 'Juan Delgado', email: 'juan.d@example.com' },
    date: '24 Oct, 2023 · 14:20',
    answers: [
      { question: '¿Qué tan satisfecho estás con la interfaz del producto?', answer: 'Muy satisfecho' },
      { question: '¿Qué funcionalidades adicionales te gustaría ver?', answer: '"La interfaz de usuario es muy intuitiva, pero me gustaría ver más opciones de exportación, especialmente a formatos PDF y CSV personalizados."' },
      { question: '¿Recomendarías nuestra herramienta a un colega?', answer: 'Definitivamente sí' },
      { question: '¿En qué dispositivo utilizas Formly con más frecuencia?', answer: 'Desktop / Laptop' },
    ],
  },
  {
    id: 'r2',
    respondent: { name: 'María López', email: 'maria.l@example.com' },
    date: '23 Oct, 2023 · 09:15',
    answers: [
      { question: '¿Qué tan satisfecho estás con la interfaz del producto?', answer: 'Satisfecho' },
      { question: '¿Qué funcionalidades adicionales te gustaría ver?', answer: '"Me encantaría tener integración con Google Sheets y la posibilidad de añadir lógica condicional entre preguntas."' },
      { question: '¿Recomendarías nuestra herramienta a un colega?', answer: 'Probablemente sí' },
      { question: '¿En qué dispositivo utilizas Formly con más frecuencia?', answer: 'Móvil' },
    ],
  },
  {
    id: 'r3',
    respondent: { name: 'Carlos Rivera', email: 'carlos.r@example.com' },
    date: '22 Oct, 2023 · 17:42',
    answers: [
      { question: '¿Qué tan satisfecho estás con la interfaz del producto?', answer: 'Neutral' },
      { question: '¿Qué funcionalidades adicionales te gustaría ver?', answer: '"Necesito mejor soporte para múltiples idiomas y una API más completa para automatizaciones."' },
      { question: '¿Recomendarías nuestra herramienta a un colega?', answer: 'Tal vez' },
      { question: '¿En qué dispositivo utilizas Formly con más frecuencia?', answer: 'Tablet' },
    ],
  },
];

type Tab = 'resumen' | 'individual' | 'visualizar';

export default function FormDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [tab, setTab] = useState<Tab>('individual');
  const [currentResponse, setCurrentResponse] = useState(0);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Tab underline animation
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then(setForm);
  }, [id]);

  // Update tab indicator position
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector<HTMLButtonElement>(
      `[data-tab="${tab}"]`,
    );
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [tab]);

  // Filter responses based on search term
  const filteredResponses = DEMO_RESPONSES.filter((response) =>
    response.respondent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.respondent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResponses = filteredResponses.length;
  const response = filteredResponses[currentResponse];

  // Reset to first response when search changes
  useEffect(() => {
    setCurrentResponse(0);
  }, [searchTerm]);

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
        {/* ── Compact Header ── */}
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
                <p className="text-xs text-gray-500">Analiza las respuestas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/form/${id}/create`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
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

          {/* ── Integrated Share Link ── */}
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

        {/* ── Tabs ── */}
        <div className="relative mt-4" ref={tabsRef}>
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
            <button
              type="button"
              data-tab="resumen"
              onClick={() => setTab('resumen')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'resumen'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Resumen
            </button>
            <button
              type="button"
              data-tab="individual"
              onClick={() => setTab('individual')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'individual'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              data-tab="visualizar"
              onClick={() => setTab('visualizar')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'visualizar'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Visualizar
            </button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="mt-4">
          {/* ── Resumen tab ── */}
          {tab === 'resumen' && (
            <div className="animate-fade-in space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary-300">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    Total respuestas
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-primary-500">{totalResponses}</p>
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

              {/* Questions list */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
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
                        <div>
                          <p className="text-sm font-medium text-gray-900">{field.label}</p>
                          <p className="mt-0.5 text-xs text-gray-500 capitalize">
                            {field.type.replace('_', ' ')}
                          </p>
                        </div>
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
          )}

          {/* ── Individual tab ── */}
          {tab === 'individual' && (
            <div className="animate-fade-in space-y-4">
              {/* Search bar */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Response card */}
              {totalResponses === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No se encontraron respuestas que coincidan con "{searchTerm}"
                    </p>
                  </div>
                </div>
              ) : response && (
                <div
                  key={response.id}
                  className="animate-fade-in rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Respondent header */}
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-primary-50 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                            Respondido por
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {response.respondent.name}{' '}
                            <span className="font-normal text-gray-500">
                              ({response.respondent.email})
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Pagination - compact version */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentResponse((prev) => Math.max(0, prev - 1))}
                          disabled={currentResponse === 0}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Anterior"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-500 font-medium min-w-[60px] text-center">
                          {currentResponse + 1} de {totalResponses}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentResponse((prev) =>
                              Math.min(totalResponses - 1, prev + 1),
                            )
                          }
                          disabled={currentResponse === totalResponses - 1}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Siguiente"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                        Fecha
                      </p>
                      <p className="text-sm font-medium text-gray-700">{response.date}</p>
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="divide-y divide-gray-50 px-5 py-2">
                    {response.answers.map((a, i) => (
                      <div key={i} className="py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {i + 1}. {a.question}
                        </p>
                        <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
                          <p
                            className={`text-sm leading-relaxed ${
                              a.answer.startsWith('"')
                                ? 'italic text-gray-600'
                                : 'text-gray-800'
                            }`}
                          >
                            {a.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Visualizar tab ── */}
          {tab === 'visualizar' && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Visualización de datos</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    Esta sección mostrará gráficos y visualizaciones interactivas de las respuestas de la encuesta.
                  </p>
                  <div className="mt-6">
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-xs font-medium text-primary-700">
                      Próximamente
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
