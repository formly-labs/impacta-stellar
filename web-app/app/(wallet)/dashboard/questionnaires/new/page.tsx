'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NewQuestionnaireShell from './components/NewQuestionnaireShell';
import ThemeStep from './steps/ThemeStep';
import FirstQuestionStep from './steps/FirstQuestionStep';
import QuestionsStep from './steps/QuestionsStep';

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
      case 'finalize':
        return <PlaceholderStep title="Finalizar" stepNum={4} />;
      default:
        return <ThemeStep />;
    }
  };

  return <NewQuestionnaireShell>{renderStep()}</NewQuestionnaireShell>;
}

function PlaceholderStep({ title, stepNum }: { title: string; stepNum: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Paso {stepNum < 10 ? `0${stepNum}` : stepNum}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="text-gray-400">Este paso estará disponible pronto.</p>
      </div>
    </div>
  );
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
