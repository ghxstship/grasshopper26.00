'use client';

import { CheckoutLayout } from '@/design-system/components/templates/CheckoutLayout/CheckoutLayout';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { useCheckout } from '@/hooks/useCheckout';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { currentStep, setCurrentStep, cart, loading } = useCheckout();

  return (
    <CheckoutLayout
      logo={
        <Typography variant="h3" as="div">
          GVTEWAY
        </Typography>
      }
      currentStep={currentStep + 1}
      totalSteps={4}
      form={
        <div className={styles.formContent}>
          <Typography variant="h2" as="h1">
            Checkout
          </Typography>
          <Typography variant="body" as="p">
            Step {currentStep + 1} of 4
          </Typography>
          
          <div className={styles.stepContent}>
            {currentStep === 0 && <div>Cart Review</div>}
            {currentStep === 1 && <div>Shipping Information</div>}
            {currentStep === 2 && <div>Payment Details</div>}
            {currentStep === 3 && <div>Order Confirmation</div>}
          </div>
          
          <div className={styles.actions}>
            {currentStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button
              variant="filled"
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
          <Typography variant="h3" as="h2">
            Order Summary
          </Typography>
          <div className={styles.summaryContent}>
            <Typography variant="body" as="p">
              {cart?.items?.length || 0} items
            </Typography>
          </div>
        </div>
      }
    />
  );
}
