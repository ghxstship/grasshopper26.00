'use client';
import { useState } from 'react';

export function useAdvanceCheckout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [advance, setAdvance] = useState<any>({ amount: 0, fee: 0 });
  const [loading, setLoading] = useState(false);

  return { currentStep, setCurrentStep, advance, loading };
}
