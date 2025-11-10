/**
 * WeatherIcon Component
 * GHXSTSHIP Entertainment Platform - Weather condition icons
 * Geometric B&W weather icons for outdoor events
 */

import * as React from 'react';
import styles from './WeatherIcon.module.css';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy';
export type WeatherIconSize = 'sm' | 'md' | 'lg';

export interface WeatherIconProps {
  condition: WeatherCondition;
  size?: WeatherIconSize;
  temperature?: number;
  className?: string;
}

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  sunny: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  cloudy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  ),
  rainy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="19" x2="8" y2="21"/>
      <line x1="8" y1="13" x2="8" y2="15"/>
      <line x1="16" y1="19" x2="16" y2="21"/>
      <line x1="16" y1="13" x2="16" y2="15"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="12" y1="15" x2="12" y2="17"/>
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
    </svg>
  ),
  stormy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
      <polyline points="13 11 9 17 15 17 11 23"/>
    </svg>
  ),
  windy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
};

export const WeatherIcon = React.forwardRef<HTMLDivElement, WeatherIconProps>(
  (
    {
      condition,
      size = 'md',
      temperature,
      className = '',
    },
    ref
  ) => {
    const containerClassNames = [
      styles.container,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <div className={styles.icon}>
          {weatherIcons[condition]}
        </div>
        {typeof temperature === 'number' && (
          <span className={styles.temp}>{temperature}°</span>
        )}
      </div>
    );
  }
);

WeatherIcon.displayName = 'WeatherIcon';
