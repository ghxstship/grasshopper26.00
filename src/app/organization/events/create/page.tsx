'use client';

import { CheckoutFlowTemplate } from '@/design-system';
import { useEventCreate } from '@/hooks/useEventCreate';

export default function EventCreatePage() {
  const { currentStep, setCurrentStep, event, loading } = useEventCreate();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'basic', label: 'Basic Info', completed: currentStep > 0 },
        { key: 'details', label: 'Event Details', completed: currentStep > 1 },
        { key: 'tickets', label: 'Tickets', completed: currentStep > 2 },
      ]}
      currentStep={currentStep}
      stepContent={<div>Create event step {currentStep + 1}</div>}
      orderSummary={<div>Event Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
