/**
 * Checkout Flow Template
 * Standardized layout for multi-step checkout/purchase flows
 * Used for: Advances checkout, Shop checkout, Ticket purchase flows
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './CheckoutFlowTemplate.module.css';

export interface CheckoutStep {
  key: string;
  label: string;
  completed: boolean;
}

export interface CheckoutFlowTemplateProps {
  // Progress
  steps: CheckoutStep[];
  currentStep: number;
  
  // Content
  stepContent: React.ReactNode;
  
  // Summary Sidebar
  orderSummary: React.ReactNode;
  
  // Navigation
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBackButton?: boolean;
  showCancelButton?: boolean;
  
  // Layout
  hideSummaryOnMobile?: boolean;
}

export function CheckoutFlowTemplate({
  steps,
  currentStep,
  stepContent,
  orderSummary,
  onNext,
  onBack,
  onCancel,
  nextLabel = 'Continue',
  nextDisabled = false,
  nextLoading = false,
  showBackButton = true,
  showCancelButton = true,
  hideSummaryOnMobile = false,
}: CheckoutFlowTemplateProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={styles.container}>
      {/* Progress Indicator */}
      <div className={styles.progressContainer}>
        <div className={styles.progressSteps}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.completed || index < currentStep;
            
            return (
              <div
                key={step.key}
                className={cn(
                  styles.progressStep,
                  isActive && styles.progressStepActive,
                  isCompleted && styles.progressStepCompleted
                )}
              >
                <div className={styles.progressStepIndicator}>
                  {isCompleted ? (
                    <Check className={styles.progressStepCheck} />
                  ) : (
                    <span className={styles.progressStepNumber}>{index + 1}</span>
                  )}
                </div>
                <span className={styles.progressStepLabel}>{step.label}</span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      styles.progressStepLine,
                      isCompleted && styles.progressStepLineCompleted
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Step Content */}
        <div className={styles.contentArea}>
          <Card className={styles.contentCard}>
            <CardContent className={styles.contentCardContent}>
              {stepContent}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className={styles.navigation}>
            <div className={styles.navigationLeft}>
              {showBackButton && !isFirstStep && onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  className={styles.backButton}
                >
                  <ChevronLeft className={styles.buttonIcon} />
                  Back
                </Button>
              )}
              {showCancelButton && onCancel && (
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className={styles.cancelButton}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className={styles.navigationRight}>
              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={nextDisabled || nextLoading}
                  className={styles.nextButton}
                >
                  {nextLoading && <LoadingSpinner size="sm" />}
                  {isLastStep ? 'Complete Order' : nextLabel}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside
          className={cn(
            styles.sidebar,
            hideSummaryOnMobile && styles.sidebarHiddenMobile
          )}
        >
          <div className={styles.sidebarSticky}>
            <Card className={styles.summaryCard}>
              <CardContent className={styles.summaryCardContent}>
                {orderSummary}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
