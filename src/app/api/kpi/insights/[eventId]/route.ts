/**
 * KPI Insights API Route
 * GET /api/kpi/insights/[eventId] - Get insights for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get('acknowledged');

    const insights = await kpiAnalyticsService.getInsights(
      eventId,
      acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined
    );

    return NextResponse.json({
      success: true,
      data: insights,
      count: insights.length,
    });
  } catch (error) {
    console.error('KPI insights API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insights',
      },
      { status: 500 }
    );
  }
}
