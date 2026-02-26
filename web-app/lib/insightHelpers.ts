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
