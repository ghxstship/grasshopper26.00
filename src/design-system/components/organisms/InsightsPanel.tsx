/**
 * Insights Panel Component (Organism)
 * Displays AI-generated insights and recommendations
 * GHXSTSHIP Contemporary Minimal Pop Art aesthetic
 */

'use client';

import React, { useState } from 'react';
import type { KPIInsight } from '@/types/kpi';
import styles from './InsightsPanel.module.css';

interface InsightsPanelProps {
  insights: KPIInsight[];
  onAcknowledge?: (insightId: string) => void;
  maxVisible?: number;
  className?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  onAcknowledge,
  maxVisible = 5,
  className,
}) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleExpanded = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const handleAcknowledge = (insightId: string) => {
    if (onAcknowledge) {
      onAcknowledge(insightId);
    }
  };

  const visibleInsights = insights.slice(0, maxVisible);

  if (insights.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className || ''}`}>
        <div className={styles.emptyIcon}>💡</div>
        <p className={styles.emptyText}>No insights available yet</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI-Powered Insights</h2>
        <span className={styles.count}>{insights.length} insights</span>
      </div>

      <div className={styles.insightsList}>
        {visibleInsights.map((insight) => {
          const isExpanded = expandedInsights.has(insight.id);

          return (
            <div
              key={insight.id}
              className={`${styles.insightCard} ${styles[`severity-${insight.severity}`]} ${
                insight.is_acknowledged ? styles.acknowledged : ''
              }`}
            >
              {/* Header */}
              <div className={styles.insightHeader}>
                <div className={styles.insightMeta}>
                  <span className={styles.insightType}>
                    {getInsightIcon(insight.insight_type)} {insight.insight_type}
                  </span>
                  <span className={styles.insightSeverity}>
                    {getSeverityIcon(insight.severity)} {insight.severity}
                  </span>
                </div>
                {insight.confidence_score && (
                  <div className={styles.confidence}>
                    {(insight.confidence_score * 100).toFixed(0)}% confidence
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className={styles.insightTitle}>{insight.insight_title}</h3>

              {/* Description */}
              <p className={styles.insightDescription}>{insight.insight_description}</p>

              {/* Recommendations */}
              {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 && (
                <div className={styles.recommendations}>
                  <button
                    type="button"
                    className={styles.expandButton}
                    onClick={() => toggleExpanded(insight.id)}
                  >
                    {isExpanded ? '▼' : '▶'} {insight.actionable_recommendations.length} Recommendations
                  </button>
                  {isExpanded && (
                    <ul className={styles.recommendationsList}>
                      {insight.actionable_recommendations.map((rec, idx) => (
                        <li key={idx} className={styles.recommendation}>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                {!insight.is_acknowledged && onAcknowledge && (
                  <button
                    type="button"
                    className={styles.acknowledgeButton}
                    onClick={() => handleAcknowledge(insight.id)}
                  >
                    ✓ Acknowledge
                  </button>
                )}
                {insight.is_acknowledged && (
                  <span className={styles.acknowledgedLabel}>
                    ✓ Acknowledged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > maxVisible && (
        <div className={styles.footer}>
          <p className={styles.moreInsights}>
            +{insights.length - maxVisible} more insights available
          </p>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getInsightIcon(type: string): string {
  switch (type) {
    case 'anomaly':
      return '⚠️';
    case 'trend':
      return '📈';
    case 'prediction':
      return '🔮';
    case 'recommendation':
      return '💡';
    default:
      return '📊';
  }
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '🟡';
    case 'info':
      return '🔵';
    case 'positive':
      return '🟢';
    default:
      return '⚪';
  }
}
