'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';

export default function AIInsightsPage() {
  const { stats, loading } = useAIInsights();

  return (
    <AdminDashboardTemplate
      title="AI Insights"
      subtitle="Machine learning predictions and recommendations"
      loading={loading}
      stats={[
        { label: 'Predictions', value: stats.predictions, icon: <Brain /> },
        { label: 'Accuracy', value: `${stats.accuracy}%`, icon: <Target /> },
        { label: 'Recommendations', value: stats.recommendations, icon: <Zap /> },
        { label: 'Impact', value: `${stats.impact}%`, icon: <TrendingUp /> },
      ]}
      tabs={[
        { key: 'predictions', label: 'Predictions', content: <div>AI predictions</div> },
        { key: 'recommendations', label: 'Recommendations', content: <div>AI recommendations</div> },
      ]}
    />
  );
}
