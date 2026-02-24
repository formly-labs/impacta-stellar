import { generateObject } from 'ai';
import z from 'zod';

type Field = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
};

type ScoringResult = {
  aiScore: number;
  reward: number;
  rewardStatus: 'pending';
};

const HIGH_TIER_THRESHOLD = 8.0; // 80% quality
const LOW_TIER_MULTIPLIER = 0.2; // below threshold gets 20% of rewardPerGoodAnswer

export async function scoreAndAssignReward(
  fields: Field[],
  answers: Record<string, string | string[]>,
  rewardPerGoodAnswer: number,
): Promise<ScoringResult> {
  const aiScore = await evaluateAnswerQuality(fields, answers);

  const reward =
    aiScore >= HIGH_TIER_THRESHOLD
      ? rewardPerGoodAnswer
      : parseFloat((rewardPerGoodAnswer * LOW_TIER_MULTIPLIER).toFixed(4));

  return { aiScore, reward, rewardStatus: 'pending' };
}

async function evaluateAnswerQuality(
  fields: Field[],
  answers: Record<string, string | string[]>,
): Promise<number> {
  const questionsAndAnswers = fields.map((field) => ({
    question: field.label,
    type: field.type,
    options: field.options.length > 0 ? field.options : undefined,
    answer: answers[field.id] ?? '(no answer)',
  }));

  const { object } = await generateObject({
    model: 'anthropic/claude-3-haiku',
    schema: z.object({
      score: z
        .number()
        .min(0)
        .max(10)
        .describe('Quality score from 0 to 10'),
    }),
    prompt: `You are an answer quality evaluator for surveys. Rate the overall quality of these survey responses on a scale of 0 to 10.

Criteria:
- Relevance: Do answers actually address the questions asked?
- Effort: Are answers thoughtful or just minimal/random filler?
- Completeness: Are questions answered fully?
- For multiple-choice questions: just verify a valid option was selected (full score for that question).
- For text/textarea questions: penalize empty, nonsensical, or copy-pasted garbage answers.

Questions and answers:
${JSON.stringify(questionsAndAnswers, null, 2)}

Return a single score from 0 to 10 (decimals allowed, e.g. 7.5).`,
  });

  return Math.round(object.score * 10) / 10;
}
