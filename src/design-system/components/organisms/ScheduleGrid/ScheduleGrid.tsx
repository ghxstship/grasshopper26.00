/**
 * ScheduleGrid Component
 * GHXSTSHIP Entertainment Platform - Event schedule/timetable
 * Excel-style grid, thick grid lines, BEBAS NEUE headers, alternating rows
 */

import * as React from 'react';
import styles from './ScheduleGrid.module.css';

export interface ScheduleSlot {
  id: string;
  artistName: string;
  startTime: string;
  endTime: string;
  stageId: string;
  notes?: string;
}

export interface Stage {
  id: string;
  name: string;
}

export interface ScheduleGridProps {
  stages: Stage[];
  slots: ScheduleSlot[];
  timeSlots: string[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  className?: string;
}

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ stages, slots, timeSlots, onSlotClick, className = '' }, ref) => {
    const classNames = [
      styles.scheduleGrid,
      className,
    ].filter(Boolean).join(' ');

    const getSlotForStageAndTime = (stageId: string, timeSlot: string): ScheduleSlot | undefined => {
      return slots.find(
        (slot) => slot.stageId === stageId && slot.startTime === timeSlot
      );
    };

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            <div className={styles.headerRow}>
              <div className={styles.timeHeader}>TIME</div>
              {stages.map((stage) => (
                <div key={stage.id} className={styles.stageHeader}>
                  {stage.name}
                </div>
              ))}
            </div>

            {timeSlots.map((timeSlot, rowIndex) => (
              <div
                key={timeSlot}
                className={`${styles.row} ${rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd}`}
              >
                <div className={styles.timeCell}>{timeSlot}</div>
                {stages.map((stage) => {
                  const slot = getSlotForStageAndTime(stage.id, timeSlot);
                  return (
                    <div
                      key={`${stage.id}-${timeSlot}`}
                      className={`${styles.slotCell} ${slot ? styles.slotCellFilled : ''}`}
                      onClick={() => slot && onSlotClick?.(slot)}
                      role={slot && onSlotClick ? 'button' : undefined}
                      tabIndex={slot && onSlotClick ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (slot && onSlotClick && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onSlotClick(slot);
                        }
                      }}
                    >
                      {slot && (
                        <>
                          <div className={styles.artistName}>{slot.artistName}</div>
                          <div className={styles.timeRange}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                          {slot.notes && (
                            <div className={styles.notes}>{slot.notes}</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ScheduleGrid.displayName = 'ScheduleGrid';
