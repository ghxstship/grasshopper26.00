'use client';
import { useState } from 'react';

export function useArtistCreate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  return { currentStep, setCurrentStep, loading };
}
