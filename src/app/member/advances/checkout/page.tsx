'use client';

import { CheckoutFlowTemplate } from '@/design-system';
import { useAdvanceCheckout } from '@/hooks/useAdvanceCheckout';

export default function AdvanceCheckoutPage() {
  const { currentStep, setCurrentStep, advance, loading } = useAdvanceCheckout();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'amount', label: 'Select Amount', completed: currentStep > 0 },
        { key: 'terms', label: 'Review Terms', completed: currentStep > 1 },
        { key: 'payment', label: 'Payment', completed: currentStep > 2 },
      ]}
      currentStep={currentStep}
      stepContent={<div>Advance checkout step {currentStep + 1}</div>}
      orderSummary={<div>Advance Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
