/**
 * Helpers for the Insight section (survey responses overview).
 * Section 1: Key insights derived from responses and form fields.
 */

export type KeyInsight = {
  id: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  visible: boolean;
  /** For styling: 'participation' | 'recommendation' | 'consistency' | 'sentiment' */
  variant: 'participation' | 'recommendation' | 'consistency' | 'sentiment';
};

export type ResponseForInsight = {
  answers: Array<{ question: string; answer: string }>;
  aiScore?: number | null;
};

export type FieldForInsight = {
  label: string;
};

/**
 * Detect if a field label looks like age/range.
 */
function isAgeLikeField(field: FieldForInsight): boolean {
  const l = field.label.toLowerCase();
  return /edad|rango|age|años|año/.test(l) || (l.includes('año') && l.length < 25);
}

/**
 * Detect if a field label looks like recommendation/NPS/satisfaction.
 */
function isRecommendationLikeField(field: FieldForInsight): boolean {
  const l = field.label.toLowerCase();
  return /recomendar|nps|satisfacción|satisfaccion|recomendación|recomendacion|recomendarías/.test(l);
}

/**
 * Get distribution of answers for a given field index; returns dominant value and its percentage.
 */
function getDistribution(
  responses: ResponseForInsight[],
  fieldIndex: number,
): { value: string; percent: number } | null {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of responses) {
    const a = r.answers[fieldIndex]?.answer?.trim();
    if (a !== undefined && a !== '') {
      counts[a] = (counts[a] ?? 0) + 1;
      total++;
    }
  }
  if (total === 0) return null;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [value, count] = entries[0];
  return { value, percent: Math.round((count / total) * 1000) / 10 };
}

/**
 * Compute completion rate: % of responses that have a non-empty answer for every field.
 */
function getCompletionRate(responses: ResponseForInsight[], fieldCount: number): number {
  if (responses.length === 0 || fieldCount === 0) return 0;
  const complete = responses.filter((r) => {
    if (r.answers.length !== fieldCount) return false;
    return r.answers.every((a) => a.answer != null && String(a.answer).trim() !== '');
  }).length;
  return Math.round((complete / responses.length) * 1000) / 10;
}

/**
 * Map average aiScore (0–10) to sentiment band and description.
 */
function getSentimentFromAiScore(avg: number): { label: string; description: string } {
  if (avg >= 7.5) {
    return {
      label: 'Positivo',
      description: `Positivo (${Math.round(avg * 10)}%), con enfoque en calidad de respuestas.`,
    };
  }
  if (avg >= 5) {
    return {
      label: 'Neutral',
      description: `Neutral (${Math.round(avg * 10)}%). Las respuestas muestran un equilibrio.`,
    };
  }
  return {
    label: 'Mejorable',
    description: `Menor puntuación (${Math.round(avg * 10)}%). Considera revisar las preguntas.`,
  };
}

/**
 * Get the 4 key insights for Section 1 (Key Insights Overview).
 * Uses only responses and fields; aiScore is optional for the 4th card.
 */
export function getKeyInsights(
  responses: ResponseForInsight[],
  fields: FieldForInsight[],
): KeyInsight[] {
  const total = responses.length;
  const fieldCount = fields.length;

  // 1. Mayor participación (age-like field)
  let insight1: KeyInsight = {
    id: 1,
    title: 'Mayor participación',
    description: 'No hay preguntas de edad o rango en este formulario.',
    visible: false,
    variant: 'participation',
  };
  const ageFieldIndex = fields.findIndex(isAgeLikeField);
  if (ageFieldIndex >= 0 && total > 0) {
    const dist = getDistribution(responses, ageFieldIndex);
    if (dist) {
      insight1 = {
        id: 1,
        title: 'Mayor participación',
        description: `El rango ${dist.value} representa el ${dist.percent}% de respuestas.`,
        visible: true,
        variant: 'participation',
      };
    }
  }

  // 2. Alta recomendación
  let insight2: KeyInsight = {
    id: 2,
    title: 'Alta recomendación',
    description: 'No hay pregunta de recomendación en este formulario.',
    visible: false,
    variant: 'recommendation',
  };
  const recFieldIndex = fields.findIndex(isRecommendationLikeField);
  if (recFieldIndex >= 0 && total > 0) {
    const dist = getDistribution(responses, recFieldIndex);
    if (dist) {
      const pct = dist.percent;
      insight2 = {
        id: 2,
        title: 'Alta recomendación',
        description: `El ${pct}% ${pct >= 50 ? 'está dispuesto a recomendar' : 'ha respondido'} (${dist.value}).`,
        visible: true,
        variant: 'recommendation',
      };
    }
  }

  // 3. Consistencia (always computed)
  const completionPercent = getCompletionRate(responses, fieldCount);
  const insight3: KeyInsight = {
    id: 3,
    title: 'Participación consistente',
    description: `Tasa de respuesta del ${completionPercent}% en todas las preguntas${completionPercent >= 90 ? ', mostrando alto engagement con la encuesta' : ''}.`,
    visible: true,
    variant: 'consistency',
  };

  // 4. Sentimiento (from aiScore if available)
  const scores = responses.map((r) => r.aiScore).filter((s): s is number => typeof s === 'number' && !Number.isNaN(s));
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  let insight4: KeyInsight = {
    id: 4,
    title: 'Sentimiento predominante',
    description: 'No hay puntuación de calidad (IA) disponible para esta encuesta.',
    visible: false,
    variant: 'sentiment',
  };
  if (avgScore != null && scores.length > 0) {
    const sentiment = getSentimentFromAiScore(avgScore);
    insight4 = {
      id: 4,
      title: 'Sentimiento predominante',
      description: sentiment.description,
      visible: true,
      variant: 'sentiment',
    };
  }

  return [insight1, insight2, insight3, insight4];
}

// ─── Section 2: Detailed analytics ─────────────────────────────────────────

export type DatasetQuality = {
  integrity: number;   // 0–100
  coherence: number;  // 0–100
  diversity: number;  // 0–100
  aiScore: number | null;  // 0–10 average, or null
};

/**
 * Dataset quality for radar chart and "SCORE IA".
 */
export function getDatasetQuality(
  responses: ResponseForInsight[],
  fieldCount: number,
): DatasetQuality {
  const n = responses.length;
  if (n === 0 || fieldCount === 0) {
    return { integrity: 0, coherence: 0, diversity: 0, aiScore: null };
  }
  const complete = responses.filter((r) => {
    if (r.answers.length !== fieldCount) return false;
    return r.answers.every((a) => a.answer != null && String(a.answer).trim() !== '');
  }).length;
  const integrity = Math.round((complete / n) * 100);

  const scores = responses.map((r) => r.aiScore).filter((s): s is number => typeof s === 'number' && !Number.isNaN(s));
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const coherence = avgScore != null ? Math.round((avgScore / 10) * 100) : integrity;

  let diversitySum = 0;
  for (let fi = 0; fi < fieldCount; fi++) {
    const values = new Set<string>();
    for (const r of responses) {
      const v = r.answers[fi]?.answer?.trim();
      if (v) values.add(v);
    }
    const ratio = values.size / Math.max(n, 1);
    diversitySum += Math.min(100, Math.round(ratio * 100));
  }
  const diversity = fieldCount > 0 ? Math.round(diversitySum / fieldCount) : 0;

  return { integrity, coherence, diversity, aiScore: avgScore };
}

export type AgeBarItem = { name: string; value: number; percent: number };
export type Demographics = {
  ageDistribution: AgeBarItem[] | null;  // null if no age-like field
  dominantAge: string | null;
  location: string;   // "No disponible" or value when we have it
  gender: string | null;  // "Femenino (62%)" or null
  completionRate: number;
};

function isGenderLikeField(field: FieldForInsight): boolean {
  const l = field.label.toLowerCase();
  return /género|gender|sexo/.test(l);
}

/**
 * Demographics: age bar data, location placeholder, gender if field exists, completion rate.
 */
export function getDemographics(
  responses: ResponseForInsight[],
  fields: FieldForInsight[],
): Demographics {
  const fieldCount = fields.length;
  const completionRate = getCompletionRate(responses, fieldCount);

  const ageFieldIndex = fields.findIndex(isAgeLikeField);
  let ageDistribution: AgeBarItem[] | null = null;
  let dominantAge: string | null = null;
  if (ageFieldIndex >= 0 && responses.length > 0) {
    const counts: Record<string, number> = {};
    for (const r of responses) {
      const a = r.answers[ageFieldIndex]?.answer?.trim();
      if (a) counts[a] = (counts[a] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((s, c) => s + c, 0);
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) dominantAge = entries[0][0];
    ageDistribution = entries.map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }));
  }

  const genderFieldIndex = fields.findIndex(isGenderLikeField);
  let gender: string | null = null;
  if (genderFieldIndex >= 0 && responses.length > 0) {
    const dist = getDistribution(responses, genderFieldIndex);
    if (dist) gender = `${dist.value} (${dist.percent}%)`;
  }

  return {
    ageDistribution,
    dominantAge,
    location: 'No disponible',
    gender,
    completionRate,
  };
}

export type Trends = {
  responsesToday: number;
  peakHourRange: string | null;  // e.g. "14:00 - 16:00"
  bounceRate: string;   // placeholder "—" or value
  avgTime: string;     // placeholder "—" or value
  device: string;      // placeholder "—" or value
  improvementMessage: string | null;
};

type ResponseWithDate = ResponseForInsight & { createdAt?: string };

/**
 * Trends: responses today and peak hour from createdAt; rest placeholders.
 */
export function getTrends(responses: ResponseWithDate[]): Trends {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hourCounts: Record<number, number> = {};
  let responsesToday = 0;
  let yesterdayCount = 0;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  for (const r of responses) {
    const iso = (r as ResponseWithDate).createdAt;
    if (!iso) continue;
    const d = new Date(iso);
    const dateStr = d.toISOString().slice(0, 10);
    if (dateStr === today) responsesToday++;
    if (dateStr === yesterdayStr) yesterdayCount++;
    const h = d.getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }

  let peakHourRange: string | null = null;
  const hours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
  if (hours.length > 0) {
    const [h] = hours[0];
    const start = parseInt(h, 10);
    const end = Math.min(23, start + 2);
    peakHourRange = `${String(start).padStart(2, '0')}:00 - ${String(end).padStart(2, '0')}:00`;
  }

  let improvementMessage: string | null = null;
  if (yesterdayCount > 0 && responsesToday > 0) {
    const pct = Math.round(((responsesToday - yesterdayCount) / yesterdayCount) * 100);
    if (pct !== 0) {
      improvementMessage = `La velocidad de respuesta ha mejorado un ${Math.abs(pct)}% respecto a ayer.`;
    }
  }

  return {
    responsesToday,
    peakHourRange,
    bounceRate: '—',
    avgTime: '—',
    device: '—',
    improvementMessage,
  };
}
