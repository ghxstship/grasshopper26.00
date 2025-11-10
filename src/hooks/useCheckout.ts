'use client';
import { useState } from 'react';
export function useCheckout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  return { currentStep, setCurrentStep, cart, loading };
}
