'use client';

import { FormEditNavigation } from '@/app/(wallet)/form/[id]/edit/components/FormEditNavigation';
import { useFormData } from '@/hooks';
import { FieldInput } from '@/types';
import {
  Activity,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  FileDown,
  FileSpreadsheet,
  LogOut,
  MapPin,
  Monitor,
  Printer,
  Search,
  Smile,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getKeyInsights,
  getDatasetQuality,
  getDemographics,
  getDemographicsInsight,
  getTrends,
  type KeyInsight,
} from '@/lib/insightHelpers';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Tab = 'insight' | 'resumen' | 'individual';

interface SurveyResponse {
  id: string;
  respondentName?: string;
  respondentWallet?: string;
  responses: Record<string, string | number | boolean>;
  createdAt: string;
  aiScore?: number | null;
}

interface ResponseData {
  id: string;
  respondent: {
    name: string;
    wallet: string;
  };
  date: string;
  createdAt?: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  aiScore?: number | null;
}

const INSIGHT_CARD_STYLES: Record<KeyInsight['variant'], { bg: string; border: string; badge: string }> = {
  participation: { bg: 'bg-primary-50', border: 'border-primary-100', badge: 'bg-primary-500' },
  recommendation: { bg: 'bg-green-50', border: 'border-green-100', badge: 'bg-green-500' },
  consistency: { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-500' },
  sentiment: { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-500' },
};

const INSIGHT_ICONS: Record<KeyInsight['variant'], React.ComponentType<{ className?: string }>> = {
  participation: TrendingUp,
  recommendation: Check,
  consistency: ArrowRight,
  sentiment: Smile,
};

function KeyInsightCard({ insight }: { insight: KeyInsight }) {
  const style = INSIGHT_CARD_STYLES[insight.variant];
  const Icon = INSIGHT_ICONS[insight.variant];
  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${style.badge}`}>
        {insight.id}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
        <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
      </div>
      <div className="absolute right-4 top-4 text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function FormAnswersPage() {
  const { id } = useParams();
  const router = useRouter();
  const formId = id as string;

  const { formData, isLoading, setFormData } = useFormData(formId);
  const [ responses, setResponses ] = useState<ResponseData[]>([]);
  const [ loadingResponses, setLoadingResponses ] = useState(true);
  const [ tab, setTab ] = useState<Tab>('resumen');
  const [ currentResponse, setCurrentResponse ] = useState(0);
  const [ searchTerm, setSearchTerm ] = useState('');

  useEffect(() => {
    if (!id) {
      router.push('/dashboard');
    }
  }, [ id, router ]);

  useEffect(() => {
    if (!isLoading && !formData.isActive) {
      router.push(`/form/${formData.id}/edit`);
    }
  }, [ isLoading, id, router, formData.isActive, formData.id ]);

  useEffect(() => {
    if (formId && !isLoading && formData.fields && formData.fields.length > 0) {
      setLoadingResponses(true);
      fetch(`/api/public/surveys/${formId}/responses`)
        .then((res) => {
          if (!res.ok) {
            console.log('No se pudieron cargar las respuestas');
            return [];
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const formattedResponses: ResponseData[] = data.map((r: SurveyResponse) => {
              const responseData = r.responses || {};
              const answersArray = formData.fields!.map((field) => {
                const fieldId = (field as FieldInput & { id?: string }).id || field.label;
                const answer = responseData[fieldId] || '';
                return {
                  question: field.label,
                  answer: String(answer),
                };
              });

              return {
                id: r.id,
                respondent: {
                  name: r.respondentName || 'Anónimo',
                  wallet: r.respondentWallet || 'Sin wallet',
                },
                date: new Date(r.createdAt).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                createdAt: r.createdAt,
                answers: answersArray,
                aiScore: (r as SurveyResponse).aiScore ?? null,
              };
            });
            setResponses(formattedResponses);
          } else {
            setResponses([]);
          }
          setLoadingResponses(false);
        })
        .catch((error) => {
          console.error('Error al cargar respuestas:', error);
          setResponses([]);
          setLoadingResponses(false);
        });
    }
  }, [ formId, isLoading, formData.fields ]);

  const filteredResponses = responses.filter((response) =>
    response.respondent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.respondent.wallet.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalResponses = filteredResponses.length;
  const response = filteredResponses[currentResponse];

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-white">
        <FormEditNavigation
          formId={formId}
          activeTab="responses"
          showPublishButton={false}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <FormEditNavigation
        formId={formId}
        activeTab="responses"
        showPublishButton={false}
      />

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Tabs internos + Download buttons */}
          <div className="shrink-0 border-b border-gray-200 px-6 py-3 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTab('resumen')}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tab === 'resumen'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Resumen
                </button>
                <button
                  type="button"
                  onClick={() => setTab('insight')}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tab === 'insight'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Insights
                </button>
                <button
                  type="button"
                  onClick={() => setTab('individual')}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tab === 'individual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Individual
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  aria-label="Descargar CSV"
                >
                  <FileDown className="h-4 w-4 text-gray-500" />
                  Descargar CSV
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  aria-label="Descargar XLSM"
                >
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  Descargar XLSM
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading responses */}
            {loadingResponses ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
                  <p className="text-sm text-gray-500">Cargando respuestas...</p>
                </div>
              </div>
            ) : responses.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">No hay respuestas todavía</p>
                  <p className="mt-1 text-sm text-gray-500">Las respuestas aparecerán aquí cuando alguien complete el
                    formulario</p>
                </div>
              </div>
            ) : (
              <>
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
                        {responses.map((response, idx) => (
                          <div key={idx} className="text-sm text-gray-700 py-1 font-mono">
                            {response.respondent.wallet}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Charts for each question */}
                    {formData.fields && formData.fields.map((field, fieldIndex) => {
                      const questionResponses = responses.map(r => r.answers[fieldIndex]?.answer).filter(Boolean);
                      const responseCounts: Record<string, number> = {};
                      questionResponses.forEach(answer => {
                        responseCounts[answer] = (responseCounts[answer] || 0) + 1;
                      });

                      const chartData = Object.entries(responseCounts).map(([ answer, count ]) => ({
                        name: answer,
                        respuestas: count,
                        value: count,
                        percentage: ((count / responses.length) * 100).toFixed(1),
                      }));

                      const colors = [ '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6' ];

                      const questionLower = field.label.toLowerCase();
                      const usePieChart = questionLower.includes('edad') ||
                        questionLower.includes('rango') ||
                        questionLower.includes('recomendarías') ||
                        questionLower.includes('dispositivo');
                      const useVerticalBar = questionLower.includes('califica') ||
                        questionLower.includes('rating') ||
                        questionLower.includes('puntua');

                      return (
                        <div
                          key={fieldIndex}
                          className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                        >
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
                                    label
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
                                  <Bar dataKey="respuestas" radius={[ 8, 8, 0, 0 ]}>
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
                                  <Bar dataKey="respuestas" radius={[ 0, 8, 8, 0 ]}>
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
                          placeholder="Buscar por nombre o wallet..."
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
                                  {response.respondent.name}
                                </p>
                                <p className="text-xs font-mono text-gray-500 mt-0.5">
                                  {response.respondent.wallet}
                                </p>
                              </div>
                            </div>

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

                {/* ── Insight tab (Section 1: Key Insights) ── */}
                {tab === 'insight' && (
                  <div className="animate-fade-in space-y-4">
                    {/* Section 1: Key Insights Overview (match design) */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="border-b border-gray-100 px-5 py-3 bg-primary-50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          KEY INSIGHTS
                        </p>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-600">
                          Análisis de {totalResponses} respuestas recibidas
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          La inteligencia artificial ha procesado los datos recientes para generar las siguientes observaciones.
                        </p>
                      </div>
                      <div className="px-6 pb-6 space-y-4">
                        {(() => {
                          const keyInsights = getKeyInsights(responses, formData.fields ?? []).filter((i) => i.visible);
                          if (keyInsights.length === 0) {
                            return (
                              <p className="text-sm text-gray-500 py-2">Completa respuestas para ver insights automáticos.</p>
                            );
                          }
                          return keyInsights.map((insight) => <KeyInsightCard key={insight.id} insight={insight} />);
                        })()}
                      </div>
                    </div>

                    {/* Section 2.1: Calidad del Dataset */}
                    {(() => {
                      const quality = getDatasetQuality(responses, formData.fields?.length ?? 0);
                      const radarData = [
                        { subject: 'Integridad', value: quality.integrity, fullMark: 100 },
                        { subject: 'Coherencia', value: quality.coherence, fullMark: 100 },
                        { subject: 'Diversidad', value: quality.diversity, fullMark: 100 },
                      ];
                      return (
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                          <div className="border-b border-gray-100 px-5 py-3 bg-primary-50 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                              Calidad del Dataset
                            </p>
                            <Sparkles className="h-4 w-4 text-primary-500" />
                          </div>
                          <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1 min-h-[240px]">
                              <ResponsiveContainer width="100%" height={240}>
                                <RadarChart data={radarData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                  <Radar name="Calidad" dataKey="value" stroke="var(--color-primary, #7c3aed)" fill="var(--color-primary, #7c3aed)" fillOpacity={0.3} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col items-center justify-center md:w-32">
                              <p className="text-2xl font-bold text-primary-600">
                                {quality.aiScore != null ? quality.aiScore.toFixed(1) : '—'}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Score IA</p>
                            </div>
                          </div>
                          <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">Integridad <strong className="text-gray-900">{quality.integrity}%</strong></span>
                            <span className="text-gray-600">Coherencia <strong className="text-gray-900">{quality.coherence}%</strong></span>
                            <span className="text-gray-600">Diversidad <strong className="text-gray-900">{quality.diversity}%</strong></span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Section 2.2 + 2.3: Demographics & Tendencias — two boxes side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {(() => {
                        const demo = getDemographics(responses, formData.fields ?? []);
                        const demoInsight = getDemographicsInsight(demo);
                        return (
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-3 bg-primary-50 flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                Análisis demográfico
                              </p>
                            </div>
                            <div className="p-5 space-y-4">
                              {demoInsight && (
                                <div className="rounded-lg border border-primary-100 bg-primary-50/50 px-4 py-3">
                                  <p className="text-sm text-gray-800">{demoInsight}</p>
                                </div>
                              )}
                              {demo.ageDistribution && demo.ageDistribution.length > 0 ? (
                                <>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rango de edad</p>
                                  <ResponsiveContainer width="100%" height={demo.ageDistribution.length * 36 + 24}>
                                    <BarChart data={demo.ageDistribution} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                      <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
                                      <Bar dataKey="percent" radius={[0, 4, 4, 0]}>
                                        {demo.ageDistribution.map((entry) => (
                                          <Cell
                                            key={entry.name}
                                            fill={entry.name === demo.dominantAge ? 'var(--color-primary, #7c3aed)' : '#e5e7eb'}
                                          />
                                        ))}
                                      </Bar>
                                      <Tooltip
                                        content={({ active, payload }) => active && payload?.[0] ? (
                                          <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
                                            {payload[0].payload.name === demo.dominantAge && (
                                              <span className="text-primary-600 font-semibold block">Predominante: {payload[0].payload.name}</span>
                                            )}
                                            <span className="text-gray-600">{payload[0].value}%</span>
                                          </div>
                                        ) : null}
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                  {demo.dominantAge && (
                                    <p className="text-xs font-medium text-primary-600">Predominante: {demo.dominantAge}</p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">No hay campo de edad en este formulario.</p>
                              )}
                              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                                  <span className="text-gray-600">Ubicación principal</span>
                                  <strong className="text-gray-900 ml-1">{demo.location}</strong>
                                </div>
                                {demo.gender && (
                                  <div className="flex items-center gap-1.5 text-sm">
                                    <User className="h-4 w-4 text-pink-500 shrink-0" />
                                    <span className="text-gray-600">Género predominante</span>
                                    <strong className="text-gray-900 ml-1">{demo.gender}</strong>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                <span className="text-2xl font-bold text-green-600">{demo.completionRate}%</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-sm text-gray-600">Tasa de finalización</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {(() => {
                        const trends = getTrends(responses);
                        return (
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-3 bg-primary-50 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-red-500" />
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                Tendencias
                              </p>
                            </div>
                            <div className="p-5 space-y-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-2xl font-bold text-green-600">+{trends.responsesToday}</span>
                                {trends.responsesToday > 0 && (
                                  <span className="rounded px-2 py-0.5 text-xs font-semibold bg-green-500 text-white">
                                    CRECIENTE
                                  </span>
                                )}
                                <span className="text-sm text-gray-600">Respuestas hoy</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Horario pico</p>
                                    <p className="text-sm font-bold text-gray-900">{trends.peakHourRange ?? '—'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tasa de rebote</p>
                                    <p className="text-sm font-bold text-gray-900">{trends.bounceRate}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Timer className="h-4 w-4 text-blue-500 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tiempo prom.</p>
                                    <p className="text-sm font-bold text-gray-900">{trends.avgTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Monitor className="h-4 w-4 text-blue-500 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Dispositivo</p>
                                    <p className="text-sm font-bold text-gray-900">{trends.device}</p>
                                  </div>
                                </div>
                              </div>
                              {trends.improvementMessage && (
                                <div className="flex gap-3 rounded-lg bg-gray-100 p-3 items-start">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-500">
                                    <Zap className="h-4 w-4 text-white" />
                                  </div>
                                  <p className="text-sm text-gray-800">{trends.improvementMessage}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Section 3: Línea de tiempo de respuestas */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="border-b border-gray-100 px-5 py-3 bg-primary-50 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          Línea de tiempo de respuestas
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {[...responses]
                            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                            .map((resp, idx) => (
                              <div
                                key={resp.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                                  <User className="h-5 w-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {resp.respondent.name}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono truncate">
                                    {resp.respondent.wallet === 'Sin wallet' ? 'Sin wallet' : resp.respondent.wallet}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-gray-600">{resp.date}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
