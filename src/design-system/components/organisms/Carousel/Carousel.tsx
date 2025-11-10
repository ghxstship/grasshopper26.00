'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Carousel.module.css';

export interface CarouselProps {
  /** Carousel items */
  children: React.ReactNode[];
  /** Auto-play interval in milliseconds */
  autoplayInterval?: number;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Show dots indicator */
  showDots?: boolean;
  /** Show autoplay toggle */
  showAutoplayToggle?: boolean;
  /** Loop carousel */
  loop?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  autoplayInterval = 5000,
  showNavigation = true,
  showDots = true,
  showAutoplayToggle = false,
  loop = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const totalSlides = children.length;

  const goToSlide = useCallback((index: number) => {
    if (loop) {
      setCurrentIndex((index + totalSlides) % totalSlides);
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, totalSlides - 1)));
    }
  }, [totalSlides, loop]);

  const goToPrevious = () => {
    goToSlide(currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, autoplayInterval, totalSlides]);

  const canGoPrevious = loop || currentIndex > 0;
  const canGoNext = loop || currentIndex < totalSlides - 1;

  return (
    <div className={`${styles.carousel} ${className}`}>
      <div
        className={styles.track}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {children.map((child, index) => (
          <div key={index} className={styles.slide}>
            {child}
          </div>
        ))}
      </div>

      {showNavigation && (
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            className={styles.navButton}
            onClick={goToNext}
            disabled={!canGoNext}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}

      {showDots && (
        <div className={styles.dots}>
          {children.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {showAutoplayToggle && (
        <button
          className={`${styles.autoplayIndicator} ${!isAutoPlaying ? styles.paused : ''}`}
          onClick={toggleAutoplay}
          aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
        >
          {isAutoPlaying ? '❚❚' : '▶'}
        </button>
      )}
    </div>
  );
};

Carousel.displayName = 'Carousel';
