/**
 * WorkflowBuilder Component
 * GHXSTSHIP Entertainment Platform - Visual workflow automation builder
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './WorkflowBuilder.module.css'

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'delay'
  label: string
  config?: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowConnection {
  id: string
  from: string
  to: string
}

export interface WorkflowBuilderProps {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  onNodeAdd?: (type: WorkflowNode['type']) => void
  onNodeClick?: (nodeId: string) => void
  onNodeDelete?: (nodeId: string) => void
  onSave?: (nodes: WorkflowNode[], connections: WorkflowConnection[]) => void
  className?: string
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  nodes,
  connections,
  onNodeAdd,
  onNodeClick,
  onNodeDelete,
  onSave,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger': return '⚡'
      case 'condition': return '?'
      case 'action': return '▶'
      case 'delay': return '⏱'
      default: return '•'
    }
  }

  return (
    <div className={`${styles.builder} ${className}`}>
      <div className={styles.toolbar}>
        <h3 className={styles.title}>Workflow Builder</h3>
        
        <div className={styles.nodeTypes}>
          <button
            className={`${styles.nodeButton} ${styles.trigger}`}
            onClick={() => onNodeAdd?.('trigger')}
          >
            ⚡ Trigger
          </button>
          <button
            className={`${styles.nodeButton} ${styles.condition}`}
            onClick={() => onNodeAdd?.('condition')}
          >
            ? Condition
          </button>
          <button
            className={`${styles.nodeButton} ${styles.action}`}
            onClick={() => onNodeAdd?.('action')}
          >
            ▶ Action
          </button>
          <button
            className={`${styles.nodeButton} ${styles.delay}`}
            onClick={() => onNodeAdd?.('delay')}
          >
            ⏱ Delay
          </button>
        </div>

        {onSave && (
          <button className={styles.saveButton} onClick={() => onSave(nodes, connections)}>
            Save Workflow
          </button>
        )}
      </div>

      <div className={styles.canvas}>
        <svg className={styles.connections}>
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from)
            const toNode = nodes.find(n => n.id === conn.to)
            if (!fromNode || !toNode) return null

            return (
              <line
                key={conn.id}
                x1={fromNode.position.x + 100}
                y1={fromNode.position.y + 40}
                x2={toNode.position.x + 100}
                y2={toNode.position.y + 40}
                className={styles.connection}
              />
            )
          })}
        </svg>

        <div className={styles.nodes}>
          {nodes.map(node => (
            <div
              key={node.id}
              className={styles.node}
              onClick={() => onNodeClick?.(node.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNodeClick?.(node.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.nodeHeader}>
                <span className={styles.nodeIcon}>{getNodeIcon(node.type)}</span>
                <span className={styles.nodeType}>{node.type}</span>
                {onNodeDelete && (
                  <button
                    className={styles.deleteButton}
                    onClick={e => {
                      e.stopPropagation()
                      onNodeDelete(node.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className={styles.nodeContent}>
                <span className={styles.nodeLabel}>{node.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

WorkflowBuilder.displayName = 'WorkflowBuilder'
