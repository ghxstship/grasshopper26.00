'use client';

import React, { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

export interface CountdownProps {
  /** Target date/time */
  targetDate: Date | string;
  /** Title text */
  title?: string;
  /** Expired message */
  expiredMessage?: string;
  /** Callback when countdown expires */
  onExpire?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  title = 'COUNTDOWN',
  expiredMessage = 'EVENT HAS STARTED',
  onExpire,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        setIsExpired(true);
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (isExpired) {
    return (
      <div className={`${styles.countdown} ${className}`}>
        <div className={styles.expired}>
          <p className={styles.expiredText}>{expiredMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.countdown} ${className}`}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.timer}>
        <div className={styles.unit}>
          <div className={styles.value}>{timeLeft.days}</div>
          <div className={styles.label}>DAYS</div>
        </div>
        <div className={styles.unit}>
          <div className={styles.value}>{timeLeft.hours}</div>
          <div className={styles.label}>HOURS</div>
        </div>
        <div className={styles.unit}>
          <div className={styles.value}>{timeLeft.minutes}</div>
          <div className={styles.label}>MINS</div>
        </div>
        <div className={styles.unit}>
          <div className={styles.value}>{timeLeft.seconds}</div>
          <div className={styles.label}>SECS</div>
        </div>
      </div>
    </div>
  );
};

Countdown.displayName = 'Countdown';
