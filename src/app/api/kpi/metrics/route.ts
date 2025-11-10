/**
 * KPI Metrics API Route
 * GET /api/kpi/metrics - List all KPI metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const coreOnly = searchParams.get('core') === 'true';

    let metrics;
    if (coreOnly) {
      metrics = await kpiAnalyticsService.getCoreMetrics();
    } else if (category) {
      metrics = await kpiAnalyticsService.getMetrics(category);
    } else {
      metrics = await kpiAnalyticsService.getMetrics();
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error('KPI metrics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      },
      { status: 500 }
    );
  }
}
