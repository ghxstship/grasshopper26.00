/**
 * VenueMap Component
 * GHXSTSHIP Entertainment Platform - Interactive Venue Map
 * Geometric stage indicators with B&W map styling
 */

'use client';

import * as React from 'react';
import styles from './VenueMap.module.css';

export interface Stage {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: 'main' | 'secondary' | 'underground';
}

export interface VenueMapProps {
  stages: Stage[];
  selectedStageId?: string;
  onStageClick?: (stageId: string) => void;
  mapImageUrl?: string;
  className?: string;
}

export const VenueMap = React.forwardRef<HTMLDivElement, VenueMapProps>(
  ({ stages, selectedStageId, onStageClick, mapImageUrl, className = '' }, ref) => {
    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.mapContainer}>
          {mapImageUrl && (
            <div className={styles.mapImage} style={{ backgroundImage: `url(${mapImageUrl})` }} />
          )}
          
          <div className={styles.stagesOverlay}>
            {stages.map((stage) => {
              const isSelected = selectedStageId === stage.id;
              
              const stageClassNames = [
                styles.stage,
                styles[stage.type || 'secondary'],
                isSelected && styles.selected,
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={stage.id}
                  className={stageClassNames}
                  style={{
                    left: `${stage.x}%`,
                    top: `${stage.y}%`,
                  }}
                  onClick={() => onStageClick?.(stage.id)}
                  aria-label={`${stage.name} stage`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.stageMarker} />
                  <span className={styles.stageName}>{stage.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendTitle}>STAGES</div>
          <div className={styles.legendItems}>
            {stages.map((stage) => (
              <button
                key={stage.id}
                className={`${styles.legendItem} ${selectedStageId === stage.id ? styles.legendItemActive : ''}`}
                onClick={() => onStageClick?.(stage.id)}
              >
                <span className={`${styles.legendMarker} ${styles[stage.type || 'secondary']}`} />
                <span className={styles.legendLabel}>{stage.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

VenueMap.displayName = 'VenueMap';
