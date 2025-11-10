'use client';

import { CheckoutFlowTemplate } from '@/design-system/components/templates';
import { useArtistCreate } from '@/hooks/useArtistCreate';

export default function ArtistCreatePage() {
  const { currentStep, setCurrentStep, loading } = useArtistCreate();

  return (
    <CheckoutFlowTemplate
      steps={[
        { key: 'profile', label: 'Artist Profile', completed: currentStep > 0 },
        { key: 'media', label: 'Media & Links', completed: currentStep > 1 },
        { key: 'publish', label: 'Publish', completed: currentStep > 2 },
      ]}
      currentStep={currentStep}
      stepContent={<div>Create artist step {currentStep + 1}</div>}
      orderSummary={<div>Artist Summary</div>}
      onNext={() => setCurrentStep(currentStep + 1)}
      onBack={() => setCurrentStep(currentStep - 1)}
      nextLoading={loading}
    />
  );
}
