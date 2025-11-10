/**
 * Countdown Component
 * GHXSTSHIP Entertainment Platform - Event countdown timer
 * BEBAS NEUE numbers, geometric layout
 */

'use client';

import * as React from 'react';
import styles from './Countdown.module.css';

export interface CountdownProps {
  targetDate: Date | string;
  onComplete?: () => void;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  onComplete,
  labels = {
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINUTES',
    seconds: 'SECONDS',
  },
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = React.useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const containerClassNames = [
    styles.countdown,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassNames}>
      <div className={styles.unit}>
        <div className={styles.value}>{String(timeRemaining.days).padStart(2, '0')}</div>
        <div className={styles.label}>{labels.days}</div>
      </div>
      
      <div className={styles.separator}>:</div>
      
      <div className={styles.unit}>
        <div className={styles.value}>{String(timeRemaining.hours).padStart(2, '0')}</div>
        <div className={styles.label}>{labels.hours}</div>
      </div>
      
      <div className={styles.separator}>:</div>
      
      <div className={styles.unit}>
        <div className={styles.value}>{String(timeRemaining.minutes).padStart(2, '0')}</div>
        <div className={styles.label}>{labels.minutes}</div>
      </div>
      
      <div className={styles.separator}>:</div>
      
      <div className={styles.unit}>
        <div className={styles.value}>{String(timeRemaining.seconds).padStart(2, '0')}</div>
        <div className={styles.label}>{labels.seconds}</div>
      </div>
    </div>
  );
};
