/**
 * CalendarView Component
 * GHXSTSHIP Entertainment Platform - Calendar view for events and tasks
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './CalendarView.module.css'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  description?: string
}

export interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onAddEvent?: (date: Date) => void
  view?: 'month' | 'week' | 'day'
  className?: string
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventClick,
  onDateClick,
  onAddEvent,
  view = 'month',
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const renderMonthView = () => {
    const days = []
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
      const dayEvents = isCurrentMonth ? getEventsForDate(date) : []

      days.push(
        <div
          key={i}
          className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''}`}
          onClick={() => isCurrentMonth && onDateClick?.(date)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              isCurrentMonth && onDateClick?.(date);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {isCurrentMonth && (
            <>
              <div className={styles.dayNumber}>{dayNumber}</div>
              <div className={styles.dayEvents}>
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={styles.event}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick?.(event.id);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        onEventClick?.(event.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className={`${styles.calendar} ${className}`}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={previousMonth}>
          ←
        </button>
        <h2 className={styles.monthYear}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button className={styles.navButton} onClick={nextMonth}>
          →
        </button>
      </div>

      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.days}>{renderMonthView()}</div>

      {onAddEvent && (
        <button className={styles.addButton} onClick={() => onAddEvent(new Date())}>
          + Add Event
        </button>
      )}
    </div>
  )
}

CalendarView.displayName = 'CalendarView'
