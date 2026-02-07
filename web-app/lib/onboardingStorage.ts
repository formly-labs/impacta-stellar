export interface OnboardingDraft {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Future steps
  [key: string]: unknown;
}

const DRAFT_KEY = 'formly:onboarding:draft';
const COMPLETED_KEY = 'formly:onboarding:completed';

export function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraft(data: Partial<OnboardingDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadDraft();
    const merged = { ...existing, ...data };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
  } catch {
    // silently fail
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COMPLETED_KEY) === 'true';
}

export function markOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLETED_KEY, 'true');
}
