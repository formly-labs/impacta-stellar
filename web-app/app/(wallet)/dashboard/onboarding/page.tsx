'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OnboardingShell from './components/OnboardingShell';
import IntroStep from './steps/IntroStep';
import DetailsStep from './steps/DetailsStep';
import SubmitStep from './steps/SubmitStep';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'intro';

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return <IntroStep />;
      case 'details':
        return <DetailsStep />;
      case 'submit':
        return <SubmitStep />;
      default:
        return <IntroStep />;
    }
  };

  return <OnboardingShell>{renderStep()}</OnboardingShell>;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
