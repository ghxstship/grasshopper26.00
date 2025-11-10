'use client';

import React from 'react';
import styles from './WeatherWidget.module.css';

export interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

export interface WeatherWidgetProps {
  /** Location name */
  location: string;
  /** Current temperature */
  temperature: number;
  /** Temperature unit */
  unit?: 'C' | 'F';
  /** Weather condition */
  condition: string;
  /** Weather icon */
  icon: string;
  /** Humidity percentage */
  humidity?: number;
  /** Wind speed */
  windSpeed?: number;
  /** Wind unit */
  windUnit?: 'mph' | 'kph';
  /** Feels like temperature */
  feelsLike?: number;
  /** UV index */
  uvIndex?: number;
  /** Forecast days */
  forecast?: ForecastDay[];
  /** Additional CSS class */
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location,
  temperature,
  unit = 'F',
  condition,
  icon,
  humidity,
  windSpeed,
  windUnit = 'mph',
  feelsLike,
  uvIndex,
  forecast,
  className = '',
}) => {
  return (
    <div className={`${styles.widget} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>WEATHER</h3>
        <div className={styles.location}>{location}</div>
      </div>

      <div className={styles.current}>
        <div className={styles.temperature}>
          {Math.round(temperature)}°{unit}
        </div>
        <div className={styles.condition}>
          <div className={styles.conditionText}>{condition}</div>
          <div className={styles.conditionIcon}>{icon}</div>
        </div>
      </div>

      <div className={styles.details}>
        {feelsLike !== undefined && (
          <div className={styles.detail}>
            <div className={styles.detailLabel}>FEELS LIKE</div>
            <div className={styles.detailValue}>
              {Math.round(feelsLike)}°{unit}
            </div>
          </div>
        )}
        {humidity !== undefined && (
          <div className={styles.detail}>
            <div className={styles.detailLabel}>HUMIDITY</div>
            <div className={styles.detailValue}>{humidity}%</div>
          </div>
        )}
        {windSpeed !== undefined && (
          <div className={styles.detail}>
            <div className={styles.detailLabel}>WIND</div>
            <div className={styles.detailValue}>
              {windSpeed} {windUnit}
            </div>
          </div>
        )}
        {uvIndex !== undefined && (
          <div className={styles.detail}>
            <div className={styles.detailLabel}>UV INDEX</div>
            <div className={styles.detailValue}>{uvIndex}</div>
          </div>
        )}
      </div>

      {forecast && forecast.length > 0 && (
        <div className={styles.forecast}>
          {forecast.map((day, index) => (
            <div key={index} className={styles.forecastDay}>
              <div className={styles.forecastDayName}>{day.day}</div>
              <div className={styles.forecastIcon}>{day.icon}</div>
              <div className={styles.forecastTemp}>
                {Math.round(day.high)}° / {Math.round(day.low)}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

WeatherWidget.displayName = 'WeatherWidget';
