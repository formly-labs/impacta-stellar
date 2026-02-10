'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NewQuestionnaireShell from './components/NewQuestionnaireShell';
import ThemeStep from './steps/ThemeStep';
import FirstQuestionStep from './steps/FirstQuestionStep';
import QuestionsStep from './steps/QuestionsStep';
import PreviewStep from './steps/PreviewStep';
import RewardsStep from './steps/RewardsStep';
import FinalizeStep from './steps/FinalizeStep';

function NewQuestionnaireContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'theme';

  const renderStep = () => {
    switch (step) {
      case 'theme':
        return <ThemeStep />;
      case 'question':
        return <FirstQuestionStep />;
      case 'questions':
        return <QuestionsStep />;
      case 'preview':
        return <PreviewStep />;
      case 'rewards':
        return <RewardsStep />;
      case 'finalize':
        return <FinalizeStep />;
      default:
        return <ThemeStep />;
    }
  };

  return <NewQuestionnaireShell>{renderStep()}</NewQuestionnaireShell>;
}

export default function NewQuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <NewQuestionnaireContent />
    </Suspense>
  );
}
