'use client';

import { CheckoutLayout } from '@/design-system';
import { Heading, Text, Button } from '@/design-system';
import { useCheckout } from '@/hooks/useCheckout';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { currentStep, setCurrentStep, cart, loading } = useCheckout();

  return (
    <CheckoutLayout
      logo={
        <Heading level={3} font="anton">
          GVTEWAY
        </Heading>
      }
      currentStep={currentStep + 1}
      totalSteps={4}
      form={
        <div className={styles.formContent}>
          <Heading level={1} font="anton">
            Checkout
          </Heading>
          <Text color="secondary">
            Step {currentStep + 1} of 4
          </Text>
          
          <div className={styles.stepContent}>
            {currentStep === 0 && <div>Cart Review</div>}
            {currentStep === 1 && <div>Shipping Information</div>}
            {currentStep === 2 && <div>Payment Details</div>}
            {currentStep === 3 && <div>Order Confirmation</div>}
          </div>
          
          <div className={styles.actions}>
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={loading || currentStep >= 3}
            >
              {currentStep === 3 ? 'Complete Order' : 'Continue'}
            </Button>
          </div>
        </div>
      }
      summary={
        <div className={styles.summary}>
          <Heading level={2} font="bebas">
            Order Summary
          </Heading>
          <div className={styles.summaryContent}>
            <Text>
              {cart?.items?.length || 0} items
            </Text>
          </div>
        </div>
      }
    />
  );
}
