'use client';
import { useState } from 'react';

export function useEventCreate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [event, setEvent] = useState<any>({});
  const [loading, setLoading] = useState(false);

  return { currentStep, setCurrentStep, event, loading };
}
