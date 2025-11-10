'use client';

import { CheckoutFlowTemplate } from '@/design-system/components/templates';
import { useCheckout } from '@/hooks/useCheckout';

export default function CheckoutPage() {
  const { currentStep, setCurrentStep, cart, loading } = useCheckout();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'cart', label: 'Cart', completed: currentStep > 0 },
        { key: 'shipping', label: 'Shipping', completed: currentStep > 1 },
        { key: 'payment', label: 'Payment', completed: currentStep > 2 },
        { key: 'confirm', label: 'Confirm', completed: currentStep > 3 },
      ]}
      currentStep={currentStep}
      stepContent={<div>Checkout step {currentStep + 1}</div>}
      orderSummary={<div>Order Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
