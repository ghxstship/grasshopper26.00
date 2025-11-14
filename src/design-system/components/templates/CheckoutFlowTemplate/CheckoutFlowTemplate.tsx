/**
 * CheckoutFlowTemplate - Multi-step flow layout template
 * Used for onboarding and checkout flows
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { ReactNode } from 'react';
import { Box, Card, Stack, Heading, Text, Button } from '@/design-system';
import styles from './CheckoutFlowTemplate.module.css';

export interface CheckoutStep {
  key: string;
  label: string;
  completed?: boolean;
}

export interface CheckoutFlowTemplateProps {
  /** Steps in the flow */
  steps: CheckoutStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Main step content */
  stepContent: ReactNode;
  /** Side / summary content */
  orderSummary?: ReactNode;
  /** Next button handler */
  onNext?: () => void;
  /** Back button handler */
  onBack?: () => void;
  /** Next button label */
  nextLabel?: string;
  /** Back button label */
  backLabel?: string;
  /** Is next action loading */
  nextLoading?: boolean;
}

export function CheckoutFlowTemplate({
  steps,
  currentStep,
  stepContent,
  orderSummary,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  nextLoading,
}: CheckoutFlowTemplateProps) {
  return (
    <Box className={styles.wrapper}>
      <div className={styles.container}>
        <Stack gap={6} className={styles.main}>
          {/* Stepper */}
          <div className={styles.stepper}>
            {steps.map((step, index) => {
              const state = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'upcoming';

              return (
                <div key={step.key} className={`${styles.step} ${styles[`step-${state}`]}`}>
                  <div className={styles.stepIndex}>{index + 1}</div>
                  <Text font="bebas" size="lg" uppercase>
                    {step.label}
                  </Text>
                </div>
              );
            })}
          </div>

          {/* Content card */}
          <Card variant="elevated" padding={8}>
            <Stack gap={6}>
              <Heading level={2} font="bebas">
                {steps[currentStep]?.label}
              </Heading>
              <div>{stepContent}</div>

              {(onNext || onBack) && (
                <div className={styles.actions}>
                  {onBack && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={onBack}
                      disabled={nextLoading}
                    >
                      {backLabel}
                    </Button>
                  )}
                  {onNext && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onNext}
                      loading={nextLoading}
                    >
                      {nextLabel}
                    </Button>
                  )}
                </div>
              )}
            </Stack>
          </Card>
        </Stack>

        {orderSummary && (
          <div className={styles.summary}>
            <Card variant="outlined" padding={6}>
              {orderSummary}
            </Card>
          </div>
        )}
      </div>
    </Box>
  );
}
