'use client';

import { FormResponse } from '@/types';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Moon,
  Printer,
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

type Tab = 'resumen' | 'individual';

export default function FormDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [tab, setTab] = useState<Tab>('individual');
  const [currentResponse, setCurrentResponse] = useState(0);
  const [isDeactivating, setIsDeactivating] = useState(false);

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

  const totalResponses = DEMO_RESPONSES.length;
  const response = DEMO_RESPONSES[currentResponse];

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
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Analiza las respuestas
            </h1>
          </div>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 ${
              form.isActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <ShieldOff className="h-4 w-4" />
            {form.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </header>

        {/* ── Tabs ── */}
        <div className="relative mt-8" ref={tabsRef}>
          <div className="flex gap-1">
            <button
              type="button"
              data-tab="resumen"
              onClick={() => setTab('resumen')}
              className={`rounded-t-lg px-5 py-3 text-sm font-medium transition-colors ${
                tab === 'resumen'
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Resumen
            </button>
            <button
              type="button"
              data-tab="individual"
              onClick={() => setTab('individual')}
              className={`rounded-t-lg px-5 py-3 text-sm font-medium transition-colors ${
                tab === 'individual'
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Individual
            </button>
          </div>
          {/* Animated underline */}
          <div className="relative h-[2px] bg-gray-200">
            <div
              className="absolute top-0 h-[2px] bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="mt-6">
          {/* ── Resumen tab ── */}
          {tab === 'resumen' && (
            <div className="animate-fade-in space-y-6">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Total respuestas
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalResponses}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Preguntas
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {form.fields?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Reward / resp.
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {form.rewardPerGoodAnswer ?? 0}
                    <span className="ml-1 text-sm font-medium text-gray-400">XLM</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Estado
                  </p>
                  <p className={`mt-2 text-lg font-bold ${form.isActive ? 'text-green-500' : 'text-red-400'}`}>
                    {form.isActive ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
              </div>

              {/* Questions list */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Preguntas de la encuesta
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {form.fields && form.fields.length > 0 ? (
                    form.fields.map((field, i) => (
                      <div key={i} className="flex items-start gap-4 px-6 py-4">
                        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{field.label}</p>
                          <p className="mt-0.5 text-xs text-gray-400 capitalize">
                            {field.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">
                      No hay preguntas definidas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Individual tab ── */}
          {tab === 'individual' && (
            <div className="animate-fade-in space-y-6">
              {/* Pagination */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-center gap-4 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setCurrentResponse((prev) => Math.max(0, prev - 1))}
                    disabled={currentResponse === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <input
                      type="text"
                      value={currentResponse + 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalResponses) {
                          setCurrentResponse(val - 1);
                        }
                      }}
                      className="h-9 w-12 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <span>de {totalResponses}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentResponse((prev) =>
                        Math.min(totalResponses - 1, prev + 1),
                      )
                    }
                    disabled={currentResponse === totalResponses - 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Response card */}
              {response && (
                <div
                  key={response.id}
                  className="animate-fade-in rounded-2xl border border-gray-200 bg-white"
                >
                  {/* Respondent header */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Respondido por
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {response.respondent.name}{' '}
                          <span className="font-normal text-gray-400">
                            ({response.respondent.email})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Fecha
                      </p>
                      <p className="text-sm text-gray-600">{response.date}</p>
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="divide-y divide-gray-50 px-6 py-2">
                    {response.answers.map((a, i) => (
                      <div key={i} className="py-5">
                        <p className="text-sm font-semibold text-gray-900">
                          {i + 1}. {a.question}
                        </p>
                        <div className="mt-3 rounded-xl bg-gray-50 px-5 py-3.5">
                          <p
                            className={`text-sm leading-relaxed ${
                              a.answer.startsWith('"')
                                ? 'italic text-gray-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {a.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar respuesta
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Moon icon */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label="Cambiar tema"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
}
