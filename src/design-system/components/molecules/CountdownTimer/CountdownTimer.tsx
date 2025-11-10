/**
 * CountdownTimer Component
 * GHXSTSHIP Entertainment Platform - Event Countdown
 * ANTON for numbers, BEBAS NEUE for labels
 */

import * as React from 'react';
import styles from './CountdownTimer.module.css';

export interface CountdownTimerProps {
  targetDate: Date | string;
  onComplete?: () => void;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = React.forwardRef<HTMLDivElement, CountdownTimerProps>(
  (
    {
      targetDate,
      onComplete,
      labels = {
        days: 'DAYS',
        hours: 'HOURS',
        minutes: 'MINUTES',
        seconds: 'SECONDS',
      },
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const [timeLeft, setTimeLeft] = React.useState<TimeLeft>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    React.useEffect(() => {
      const calculateTimeLeft = () => {
        const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
        const difference = target.getTime() - new Date().getTime();

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          if (onComplete) onComplete();
          return;
        }

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const classNames = [
      styles.countdown,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.unit}>
          <div className={styles.value}>{String(timeLeft.days).padStart(2, '0')}</div>
          <div className={styles.label}>{labels.days}</div>
        </div>

        <div className={styles.separator}>:</div>

        <div className={styles.unit}>
          <div className={styles.value}>{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className={styles.label}>{labels.hours}</div>
        </div>

        <div className={styles.separator}>:</div>

        <div className={styles.unit}>
          <div className={styles.value}>{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className={styles.label}>{labels.minutes}</div>
        </div>

        <div className={styles.separator}>:</div>

        <div className={styles.unit}>
          <div className={styles.value}>{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className={styles.label}>{labels.seconds}</div>
        </div>
      </div>
    );
  }
);

CountdownTimer.displayName = 'CountdownTimer';
