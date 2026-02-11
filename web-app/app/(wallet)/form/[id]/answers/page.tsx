'use client';

import { FormResponse } from '@/types';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Moon,
  Printer,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';

/* ────────────────────────────────────────────────────────────
   Demo responses (until real response model exists)
   ──────────────────────────────────────────────────────────── */
const DEMO_RESPONSES = [
  {
    id: 'r1',
    respondent: { name: 'Juan Delgado', email: 'juan.d@example.com' },
    date: '24 Oct, 2023 · 14:20',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Muy satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '5' },
    ],
  },
  {
    id: 'r2',
    respondent: { name: 'María López', email: 'maria.l@example.com' },
    date: '23 Oct, 2023 · 09:15',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '19 – 24' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r3',
    respondent: { name: 'Carlos Rivera', email: 'carlos.r@example.com' },
    date: '22 Oct, 2023 · 17:42',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Neutral' },
      { question: '¿Recomendarías este producto?', answer: 'Depende de la recompensa' },
      { question: '¿Qué dispositivo usas más?', answer: 'Tablet' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '3' },
    ],
  },
  {
    id: 'r4',
    respondent: { name: 'Ana Martínez', email: 'ana.m@example.com' },
    date: '24 Oct, 2023 · 11:30',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '30 – 35' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Muy satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '5' },
    ],
  },
  {
    id: 'r5',
    respondent: { name: 'Pedro Sánchez', email: 'pedro.s@example.com' },
    date: '24 Oct, 2023 · 16:45',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r6',
    respondent: { name: 'Laura Gómez', email: 'laura.g@example.com' },
    date: '23 Oct, 2023 · 13:20',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '19 – 24' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Muy satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '5' },
    ],
  },
  {
    id: 'r7',
    respondent: { name: 'Roberto Díaz', email: 'roberto.d@example.com' },
    date: '23 Oct, 2023 · 10:00',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r8',
    respondent: { name: 'Sofia Torres', email: 'sofia.t@example.com' },
    date: '22 Oct, 2023 · 19:15',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: 'Más de 35' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r9',
    respondent: { name: 'Miguel Ángel', email: 'miguel.a@example.com' },
    date: '22 Oct, 2023 · 15:30',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Muy satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '5' },
    ],
  },
  {
    id: 'r10',
    respondent: { name: 'Carmen Ruiz', email: 'carmen.r@example.com' },
    date: '21 Oct, 2023 · 12:00',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '19 – 24' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Neutral' },
      { question: '¿Recomendarías este producto?', answer: 'No' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '3' },
    ],
  },
  {
    id: 'r11',
    respondent: { name: 'Diego Fernández', email: 'diego.f@example.com' },
    date: '21 Oct, 2023 · 09:45',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Tablet' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r12',
    respondent: { name: 'Isabella Castro', email: 'isabella.c@example.com' },
    date: '20 Oct, 2023 · 18:20',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: 'Menos de 18' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Depende de la recompensa' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r13',
    respondent: { name: 'Fernando Vargas', email: 'fernando.v@example.com' },
    date: '20 Oct, 2023 · 14:50',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Muy satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '5' },
    ],
  },
  {
    id: 'r14',
    respondent: { name: 'Valentina Morales', email: 'valentina.m@example.com' },
    date: '20 Oct, 2023 · 11:15',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '30 – 35' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Desktop' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
  {
    id: 'r15',
    respondent: { name: 'Andrés Jiménez', email: 'andres.j@example.com' },
    date: '19 Oct, 2023 · 16:30',
    answers: [
      { question: '¿En qué rango de edad estás?', answer: '25 – 29' },
      { question: '¿Qué tan satisfecho estás con el producto?', answer: 'Satisfecho' },
      { question: '¿Recomendarías este producto?', answer: 'Sí' },
      { question: '¿Qué dispositivo usas más?', answer: 'Móvil' },
      { question: 'Califica del 1 al 5 la facilidad de uso', answer: '4' },
    ],
  },
];

type Tab = 'resumen' | 'individual' | 'analisis';

export default function FormAnswersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [tab, setTab] = useState<Tab>('individual');
  const [currentResponse, setCurrentResponse] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then(setForm);
  }, [id]);

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
        {/* ── Simple Header ── */}
        <header className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/form/${id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">
                  {form.title}
                </h1>
                <p className="text-xs text-gray-500">Respuestas individuales</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="mt-4">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
            <button
              type="button"
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
              onClick={() => setTab('analisis')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'analisis'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Análisis de datos
            </button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="mt-4">
          {/* ── Resumen tab ── */}
          {tab === 'resumen' && (
            <div className="animate-fade-in space-y-4">
              {/* Who has responded */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    WHO HAS RESPONDED?
                  </p>
                </div>
                <div className="p-5 space-y-2">
                  {DEMO_RESPONSES.map((response, idx) => (
                    <div key={idx} className="text-sm text-gray-700 py-1">
                      {response.respondent.email}
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts for each question */}
              {form.fields && form.fields.map((field, fieldIndex) => {
                const responses = DEMO_RESPONSES.map(r => r.answers[fieldIndex]?.answer).filter(Boolean);
                const responseCounts: Record<string, number> = {};
                responses.forEach(answer => {
                  responseCounts[answer] = (responseCounts[answer] || 0) + 1;
                });
                
                const chartData = Object.entries(responseCounts).map(([answer, count]) => ({
                  name: answer,
                  respuestas: count,
                  value: count,
                  percentage: ((count / responses.length) * 100).toFixed(1)
                }));

                const colors = ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];
                
                const questionLower = field.label.toLowerCase();
                const usePieChart = questionLower.includes('edad') || 
                                    questionLower.includes('rango') || 
                                    questionLower.includes('recomendarías') ||
                                    questionLower.includes('dispositivo');
                const useVerticalBar = questionLower.includes('califica') || 
                                       questionLower.includes('rating') ||
                                       questionLower.includes('puntua');

                return (
                  <div key={fieldIndex} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-5 py-3 bg-primary-50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {field.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {responses.length} respuestas
                        </p>
                      </div>
                      <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        Copy chart
                      </button>
                    </div>
                    
                    <div className="p-6">
                      {usePieChart && (
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {payload[0].value} respuestas ({payload[0].payload.percentage}%)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      
                      {!usePieChart && useVerticalBar && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {payload[0].value} respuestas ({payload[0].payload.percentage}%)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="respuestas" radius={[8, 8, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      
                      {!usePieChart && !useVerticalBar && (
                        <ResponsiveContainer width="100%" height={chartData.length * 60 + 40}>
                          <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={150}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {payload[0].value} respuestas ({payload[0].payload.percentage}%)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="respuestas" radius={[0, 8, 8, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                );
              })}
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
                      No se encontraron respuestas que coincidan con &quot;{searchTerm}&quot;
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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 shadow-md">
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
                      
                      {/* Pagination */}
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

          {/* ── Análisis tab ── */}
          {tab === 'analisis' && (
            <div className="animate-fade-in space-y-4">
              {/* Key Insights */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    📊 Insights Clave
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Mayor participación</p>
                      <p className="text-xs text-gray-600 mt-1">
                        El rango de edad 25-29 representa el 45.2% de las respuestas, siendo el grupo demográfico más activo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Alta tasa de recomendación</p>
                      <p className="text-xs text-gray-600 mt-1">
                        El 80% de los encuestados está dispuesto a recomendar, indicando un alto nivel de satisfacción.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Participación consistente</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Tasa de respuesta del 100% en todas las preguntas, mostrando alto engagement con la encuesta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographic Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      👥 Análisis Demográfico
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Edad promedio</span>
                      <span className="text-sm font-bold text-primary-600">25-29 años</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total participantes</span>
                      <span className="text-sm font-bold text-primary-600">{totalResponses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Tasa de finalización</span>
                      <span className="text-sm font-bold text-success">100%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      📈 Tendencias
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Respuestas hoy</span>
                      <span className="text-sm font-bold text-green-600">+{totalResponses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Tiempo promedio</span>
                      <span className="text-sm font-bold text-gray-900">2:30 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Dispositivo más usado</span>
                      <span className="text-sm font-bold text-gray-900">Desktop</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Timeline */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    ⏱️ Línea de Tiempo de Respuestas
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {DEMO_RESPONSES.map((resp, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {resp.respondent.name}
                          </p>
                          <p className="text-xs text-gray-500">{resp.respondent.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{resp.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    💬 Análisis de Sentimiento
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-2xl mb-2">😊</div>
                      <p className="text-2xl font-bold text-green-600">60%</p>
                      <p className="text-xs text-gray-600 mt-1">Positivo</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-2xl mb-2">😐</div>
                      <p className="text-2xl font-bold text-gray-600">30%</p>
                      <p className="text-xs text-gray-600 mt-1">Neutral</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-2xl mb-2">😟</div>
                      <p className="text-2xl font-bold text-red-600">10%</p>
                      <p className="text-xs text-gray-600 mt-1">Negativo</p>
                    </div>
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
