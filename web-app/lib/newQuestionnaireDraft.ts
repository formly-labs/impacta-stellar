export type QuestionnaireTheme = 'Product UX' | 'Segmentation' | 'Sales';

export type AnswerType = 'radio' | 'checkbox' | 'short_text' | 'long_text';

export interface QuestionDraft {
  id: string;
  title: string;
  type: AnswerType;
  options: string[];
  allowOther?: boolean;
}

export type RewardPreset = '5' | '10' | '15' | 'custom';

export interface QuestionnaireDraft {
  theme?: QuestionnaireTheme;
  firstQuestion?: string;
  questions?: QuestionDraft[];
  rewardPerGoodAnswer?: number;
  rewardPreset?: RewardPreset;
}

const DRAFT_KEY = 'formly:newQuestionnaire:draft';

export function loadQuestionnaireDraft(): QuestionnaireDraft {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as QuestionnaireDraft) : {};
  } catch {
    return {};
  }
}

export function saveQuestionnaireDraft(data: Partial<QuestionnaireDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadQuestionnaireDraft();
    const merged = { ...existing, ...data };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
  } catch {
    // silently fail
  }
}

export function clearQuestionnaireDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}

let _idCounter = 0;
export function generateQuestionId(): string {
  _idCounter += 1;
  return `q_${Date.now()}_${_idCounter}`;
}

export function createEmptyQuestion(): QuestionDraft {
  return {
    id: generateQuestionId(),
    title: '',
    type: 'radio',
    options: ['', ''],
    allowOther: false,
  };
}
