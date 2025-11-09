'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdvanceCart } from '@/contexts/AdvanceCartContext';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { CartItem } from '@/design-system/components/molecules/CartItem';
import { AdvanceFormData } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

type CheckoutStep = 'cart' | 'details' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, clearCart } = useAdvanceCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [formData, setFormData] = useState<AdvanceFormData>({
    event_id: null,
    event_name: '',
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    service_start_date: null,
    service_end_date: null,
    purpose: '',
    special_considerations: '',
    additional_notes: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0 && currentStep !== 'cart') {
      router.push('/advances/catalog');
    }
  }, [itemCount, currentStep, router]);

  const handleFormChange = (field: keyof AdvanceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceedToDetails = () => {
    setCurrentStep('details');
  };

  const handleProceedToReview = () => {
    // Validate required fields
    if (!formData.event_name || !formData.company_name || !formData.contact_name || !formData.contact_email || !formData.service_start_date || !formData.service_end_date) {
      alert('Please fill in all required fields');
      return;
    }
    setCurrentStep('review');
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advance: {
            ...formData,
            service_start_date: formData.service_start_date?.toISOString(),
            service_end_date: formData.service_end_date?.toISOString(),
          },
          items: items.map((item) => ({
            catalog_item_id: item.catalog_item_id,
            category_name: item.category_name,
            item_name: item.item_name,
            item_description: item.item_description,
            make: item.make,
            model: item.model,
            quantity: item.quantity,
            modifiers: item.modifiers,
            item_notes: item.item_notes,
          })),
          submit: !isDraft,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit advance');
      }

      const { advance } = await response.json();

      // Clear cart
      clearCart();

      // Redirect to confirmation or advance detail
      if (isDraft) {
        router.push(`/advances/${advance.id}`);
      } else {
        router.push(`/advances/${advance.id}/confirmation`);
      }
    } catch (error) {
      console.error('Error submitting advance:', error);
      alert('Failed to submit advance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (!formData.service_start_date || !formData.service_end_date) return 0;
    const diff = formData.service_end_date.getTime() - formData.service_start_date.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-anton text-4xl uppercase">CREATE ADVANCE REQUEST</h1>
          <p className="mt-2 font-share-tech text-grey-700">
            Complete your production advance request
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b-2 border-grey-200 bg-grey-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { key: 'cart', label: 'Items Selected' },
              { key: 'details', label: 'Request Details' },
              { key: 'review', label: 'Review & Submit' },
            ].map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center border-3 font-bebas-neue text-lg',
                      currentStep === step.key
                        ? 'border-black bg-black text-white'
                        : index < ['cart', 'details', 'review'].indexOf(currentStep)
                        ? 'border-black bg-white text-black'
                        : 'border-grey-400 bg-grey-200 text-grey-600'
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden font-bebas-neue uppercase sm:inline',
                      currentStep === step.key ? 'text-black' : 'text-grey-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className="h-0.5 w-12 bg-grey-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Step 1: Cart Review */}
        {currentStep === 'cart' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="font-anton text-3xl uppercase">REVIEW YOUR ITEMS</h2>
              <p className="mt-2 font-share-tech text-grey-700">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your advance request
              </p>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-3 border-grey-300 bg-grey-50 py-20 text-center">
                <GeometricIcon name="cart" size="xl" className="mb-4 text-grey-400" />
                <p className="font-share-tech text-grey-700">Your cart is empty</p>
                <button
                  type="button"
                  onClick={() => router.push('/advances/catalog')}
                  className="mt-4 border-3 border-black bg-white px-6 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
                >
                  BROWSE CATALOG
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y-2 divide-grey-200 border-3 border-black">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/advances/catalog')}
                    className="border-3 border-black bg-white px-6 py-4 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
                  >
                    ← ADD MORE ITEMS
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToDetails}
                    className="flex flex-1 items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
                  >
                    PROCEED TO DETAILS
                    <GeometricIcon name="arrow-right" size="md" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Request Details */}
        {currentStep === 'details' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="font-anton text-3xl uppercase">REQUEST DETAILS</h2>
              <p className="mt-2 font-share-tech text-grey-700">
                Provide information about your advance request
              </p>
            </div>

            <div className="space-y-8">
              {/* Event Information */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-6 font-bebas-neue text-xl uppercase">EVENT INFORMATION</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="event_name" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Event Name *
                    </label>
                    <input
                      id="event_name"
                      type="text"
                      value={formData.event_name}
                      onChange={(e) => handleFormChange('event_name', e.target.value)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company_name" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Company *
                    </label>
                    <input
                      id="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleFormChange('company_name', e.target.value)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Point of Contact */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-6 font-bebas-neue text-xl uppercase">POINT OF CONTACT</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact_name" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Name *
                    </label>
                    <input
                      id="contact_name"
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => handleFormChange('contact_name', e.target.value)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_email" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Email *
                    </label>
                    <input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleFormChange('contact_email', e.target.value)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Phone
                    </label>
                    <input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => handleFormChange('contact_phone', e.target.value)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                    />
                  </div>
                </div>
              </div>

              {/* Service Period */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-6 font-bebas-neue text-xl uppercase">SERVICE PERIOD</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="service_start_date" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Start Date *
                    </label>
                    <input
                      id="service_start_date"
                      type="date"
                      value={formData.service_start_date?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleFormChange('service_start_date', e.target.value ? new Date(e.target.value) : null)}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="service_end_date" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      End Date *
                    </label>
                    <input
                      id="service_end_date"
                      type="date"
                      value={formData.service_end_date?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleFormChange('service_end_date', e.target.value ? new Date(e.target.value) : null)}
                      min={formData.service_start_date?.toISOString().split('T')[0]}
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                      required
                    />
                  </div>
                </div>

                {formData.service_start_date && formData.service_end_date && (
                  <div className="mt-4 border-t-2 border-grey-200 pt-4">
                    <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                      DURATION: {calculateDuration()} DAYS
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-6 font-bebas-neue text-xl uppercase">ADDITIONAL INFORMATION</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="purpose" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Purpose
                    </label>
                    <textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleFormChange('purpose', e.target.value)}
                      rows={3}
                      placeholder="What is this equipment/service needed for?"
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="special_considerations" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Special Considerations
                    </label>
                    <textarea
                      id="special_considerations"
                      value={formData.special_considerations}
                      onChange={(e) => handleFormChange('special_considerations', e.target.value)}
                      rows={3}
                      placeholder="Any special requirements, restrictions, or considerations?"
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="additional_notes" className="mb-2 block font-share-tech-mono text-xs uppercase">
                      Additional Notes
                    </label>
                    <textarea
                      id="additional_notes"
                      value={formData.additional_notes}
                      onChange={(e) => handleFormChange('additional_notes', e.target.value)}
                      rows={3}
                      placeholder="Any other information we should know?"
                      className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('cart')}
                className="border-3 border-black bg-white px-6 py-4 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
              >
                ← BACK TO CART
              </button>
              <button
                type="button"
                onClick={handleProceedToReview}
                className="flex flex-1 items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
              >
                REVIEW REQUEST
                <GeometricIcon name="arrow-right" size="md" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 'review' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="font-anton text-3xl uppercase">REVIEW YOUR ADVANCE</h2>
              <p className="mt-2 font-share-tech text-grey-700">
                Please review all details before submitting
              </p>
            </div>

            <div className="space-y-6">
              {/* Event Details */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-4 font-bebas-neue text-xl uppercase">EVENT DETAILS</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Event</dt>
                    <dd className="font-share-tech text-sm">{formData.event_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Company</dt>
                    <dd className="font-share-tech text-sm">{formData.company_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Contact</dt>
                    <dd className="font-share-tech text-sm">{formData.contact_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Email</dt>
                    <dd className="font-share-tech text-sm">{formData.contact_email}</dd>
                  </div>
                  {formData.contact_phone && (
                    <div className="flex justify-between">
                      <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Phone</dt>
                      <dd className="font-share-tech text-sm">{formData.contact_phone}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Service Period */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-4 font-bebas-neue text-xl uppercase">SERVICE PERIOD</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Start Date</dt>
                    <dd className="font-share-tech text-sm">
                      {formData.service_start_date?.toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">End Date</dt>
                    <dd className="font-share-tech text-sm">
                      {formData.service_end_date?.toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Duration</dt>
                    <dd className="font-share-tech text-sm">{calculateDuration()} days</dd>
                  </div>
                </dl>
              </div>

              {/* Requested Items */}
              <div className="border-3 border-black bg-white p-6">
                <h3 className="mb-4 font-bebas-neue text-xl uppercase">REQUESTED ITEMS</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 border-b-2 border-grey-200 pb-3 last:border-0 last:pb-0">
                      <span className="font-bebas-neue text-lg">{item.quantity}x</span>
                      <div className="flex-1">
                        <p className="font-bebas-neue uppercase">{item.name}</p>
                        {item.make && item.model && (
                          <p className="font-share-tech-mono text-xs text-grey-600">
                            {item.make} {item.model}
                          </p>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="mt-1 font-share-tech text-xs text-grey-600">
                            {item.modifiers.map((m) => `+ ${m.name}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t-2 border-grey-200 pt-4">
                  <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                    TOTAL ITEMS: {itemCount}
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="border-3 border-black bg-white p-6">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-5 w-5"
                  />
                  <span className="font-share-tech text-sm">
                    I confirm that all information is accurate and understand that this request is subject to approval and availability.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('details')}
                className="border-3 border-black bg-white px-6 py-4 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
              >
                ← EDIT DETAILS
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="border-3 border-black bg-white px-6 py-4 font-bebas-neue uppercase transition-colors hover:bg-grey-100 disabled:opacity-50"
              >
                SAVE AS DRAFT
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!agreedToTerms || isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ADVANCE REQUEST'}
                <GeometricIcon name="arrow-right" size="md" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
