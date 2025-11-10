/**
 * KanbanBoard Component
 * GHXSTSHIP Entertainment Platform - Drag-and-drop kanban board
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './KanbanBoard.module.css'

export interface KanbanCard {
  id: string
  title: string
  description?: string
  assignee?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date
  tags?: string[]
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
  limit?: number
}

export interface KanbanBoardProps {
  columns: KanbanColumn[]
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void
  onCardClick?: (cardId: string) => void
  onAddCard?: (columnId: string) => void
  className?: string
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onCardMove,
  onCardClick,
  onAddCard,
  className = '',
}) => {
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; columnId: string } | null>(null)

  const handleDragStart = (cardId: string, columnId: string) => {
    setDraggedCard({ cardId, columnId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toColumnId: string) => {
    if (draggedCard && draggedCard.columnId !== toColumnId) {
      onCardMove?.(draggedCard.cardId, draggedCard.columnId, toColumnId)
    }
    setDraggedCard(null)
  }

  return (
    <div className={`${styles.board} ${className}`}>
      {columns.map(column => (
        <div
          key={column.id}
          className={styles.column}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <span className={styles.columnName}>{column.title}</span>
              <span className={styles.columnCount}>
                {column.cards.length}
                {column.limit && ` / ${column.limit}`}
              </span>
            </div>
            {onAddCard && (
              <div
                className={styles.card}
                onClick={() => onAddCard(column.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAddCard(column.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                +
              </div>
            )}
          </div>

          <div className={styles.cardList}>
            {column.cards.map(card => (
              <div
                key={card.id}
                className={styles.card}
                draggable
                onDragStart={() => handleDragStart(card.id, column.id)}
                onClick={() => onCardClick?.(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCardClick?.(card.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>{card.title}</h4>
                  {card.priority && (
                    <span className={`${styles.priority} ${styles[card.priority]}`}>
                      {card.priority}
                    </span>
                  )}
                </div>

                {card.description && (
                  <p className={styles.cardDescription}>{card.description}</p>
                )}

                {card.tags && card.tags.length > 0 && (
                  <div className={styles.tags}>
                    {card.tags.map((tag, idx) => (
                      <span key={idx} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  {card.assignee && (
                    <span className={styles.assignee}>{card.assignee}</span>
                  )}
                  {card.dueDate && (
                    <span className={styles.dueDate}>
                      {card.dueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

KanbanBoard.displayName = 'KanbanBoard'
