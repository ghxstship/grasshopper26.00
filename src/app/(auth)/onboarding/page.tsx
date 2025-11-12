'use client';

import { CheckoutFlowTemplate } from '@/design-system/components/templates';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingPage() {
  const { currentStep, setCurrentStep, loading } = useOnboarding();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'welcome', label: 'Welcome', completed: currentStep > 0 },
        { key: 'profile', label: 'Profile', completed: currentStep > 1 },
        { key: 'preferences', label: 'Preferences', completed: currentStep > 2 },
        { key: 'complete', label: 'Complete', completed: currentStep > 3 },
      ]}
      currentStep={currentStep}
      stepContent={<div>Onboarding step {currentStep + 1}</div>}
      orderSummary={<div>Progress Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
