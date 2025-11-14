'use client';

import { CheckoutFlowTemplate } from '@/design-system';
import { useEventCreate } from '@/hooks/useEventCreate';

export default function EventNewPage() {
  const { currentStep, setCurrentStep, loading } = useEventCreate();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'template', label: 'Choose Template', completed: currentStep > 0 },
        { key: 'details', label: 'Event Details', completed: currentStep > 1 },
        { key: 'publish', label: 'Publish', completed: currentStep > 2 },
      ]}
      currentStep={currentStep}
      stepContent={<div>New event step {currentStep + 1}</div>}
      orderSummary={<div>Event Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
